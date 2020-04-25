import React from "react";


export type Props<Value> = {
    label: string;
    value: Value
    onChange: (val: Value) => void;
    valid?: ValidationResult
    readonly?: boolean
}
export type InputComponent<Props> = (new (props: Props) => React.Component<Props>) | (React.FunctionComponent<Props>)

export type FormInputs<
    TextProps extends Props<string>, 
    NumberProps extends Props<number>,
    ChoiceProps extends Props<string>,
    DateProps extends Props<Date>
> = {
    text?: InputComponent<TextProps>
    number?: InputComponent<NumberProps>
    choice?: InputComponent<ChoiceProps & {choices: any}>
    date?: InputComponent<DateProps>
}

type Input = {
    text: string;
    number: number;
    choice: string;
    date: Date;
}

export type ValidationResult = ["ok", string] | ["error", any]

type Validator<Data> =
    (data: Data) => Promise<ValidationResult>;

type Criterion<Data> = 
    (data: Data) => Promise<boolean>;


type Config<K extends keyof Input> = {
    name: string;
    label: string;
    type: K;
    default: Input[K]
    props?: Record<string, any>; // any additional props to pass to the input
}

/**
 * Some fields will require validation. Others will not.
 * Some fields will require being set to read-only. Others will not.
 * Some field will have choices. Others will not.
 * 
 * @handle is used to provide functions so for the caller to directly manipulate the internals
 */
type FormProps = {
    validation: Record<string, Validator<any> | undefined>;
    readonly: Record<string, Criterion<any> | undefined>;
    choices: Record<string, any[] | undefined>;
    handle: any;
}

export const Form = {
    /**
     * Returns a function that, given the correct input, will generate the form.
     */
    install: function<TextProps extends Props<string>, 
                      NumberProps extends Props<number>,
                      ChoiceProps extends Props<string>,
                      DateProps extends Props<Date>,
                    >(input: FormInputs<TextProps, NumberProps, ChoiceProps, DateProps>) {

        return function make(config: Config<any>[], startActive?: boolean) {

            return function Form(props: FormProps) {
                const [valid, readonly, value, setValue] = useForm(config, props, startActive);
                return (
                    <React.Fragment>
                        {renderConfig(config, input, [valid, readonly, value, setValue], props)}
                    </React.Fragment>
                );
            }
        }
    }
}
export default Form;

type HookReturn = 
    [ (name: string) => ValidationResult
    , (name: string) => boolean
    , (name: string) => any
    , (name: string, value: any) => void
    ];

function useForm(configs: Config<any>[], props: FormProps, startActive?: boolean): HookReturn {
    const [refreshing, setRefreshing] = React.useState(true);

    const [active, setActive] = React.useState(startActive ? true: false);

    const data_: Record<string, any> = configs.reduce((acc, config) => {
        acc[config.name] = config.default;
        return acc;
    }, {} as any);

    const [data, setData] = React.useState(data_);

    const [valid, setValid ] = React.useState({} as Record<string, ValidationResult>);

    const [readonly, setReadonly] = React.useState({} as Record<string, boolean>);

    // eslint-disable-next-line
    React.useEffect(() => {
        if(refreshing) {
            refresh();
            setRefreshing(false);
        }
    })

    initializeHandle(props);

    // Possibly we should create the State first, and then set the values as done above

    const _valid = (name: string): ValidationResult => {
        return active && valid[name] !== undefined ? valid[name] : ["ok", ""]
    }

    const _readonly = (name: string): boolean => {
        return active && readonly[name] !== undefined ? readonly[name] : false;
    }

    const _value = (name: string) => {
        return data[name];
    }

    const _setValue = (name: string, value: string) => {
        let newData = Object.assign({}, data);
        newData[name] = value;
        console.log("NEW DATA: " + JSON.stringify(newData));
        setData(newData);

        // We run the logic asynchronously so that the validation runs on the new data, not the old
        setTimeout(() => {
            runValidation(name, newData);
            runCriterion(name, newData);
        })
    }

    return [_valid, _readonly, _value, _setValue];

    function runValidation(name: string, data: any) {
        console.log("running validation for " + name);
        const validator = props.validation[name]
        if(validator) {
            let newValid = Object.assign({}, valid);
            console.log("data: " + JSON.stringify(data));
            validator(data).then((result) => {
                console.log("result: " + result);
                newValid[name] = result;
                setValid(newValid);
            }).catch((reason) => {
                newValid[name]= ["error", reason !== undefined && reason.toString ? reason.toString() : reason];
                setValid(newValid);
            })
        } else {
            console.log ("no validator for " + name)
        }
    }

    function runCriterion(name: string, data: any) {
        const criterion = props.readonly[name];
        if(criterion) {
            let newReadonly = Object.assign({}, readonly);
            criterion(data).then((result) => {
                newReadonly[name] = result;
                setReadonly(newReadonly);
            }).catch((_reason) => {
                newReadonly[name] = false;
                setReadonly(newReadonly);
            })
        }
    }

    /**
     * Configure the prop handle to have the appropriate functions for getting/setting the form data,
     * activating/inactivating the validation and readonly logic
     * 
     * May also want to allow caller to read the valid/readonly states as well.
     */
    function initializeHandle(props: FormProps) {
        props.handle.getForm = () => {
            let d = Object.assign({}, data);
            return d;
        }

        props.handle.setForm = (data: any) => {
            configs.forEach((config) => {
                if(data[config.name] !== undefined) {
                    _setValue(config.name, data[config.name]);
                }
            })
        }

        props.handle.setActive = (flag: boolean) => {
            setActive(flag);
            refresh();
        }

        props.handle.refresh = () => {
            setRefreshing(true);
        }
    }

    /**
     * Rerun all the validations and readonly measures, if 
     * the the logic is active.
     */
    function refresh() {
        if(active) {
            configs.forEach((config) => {
                runValidation(config.name, data);
                runCriterion(config.name, data);
            })
        }
    }
}

function renderConfig<TextProps extends Props<string>, 
                      NumberProps extends Props<number>,
                      ChoiceProps extends Props<string>,
                      DateProps extends Props<Date>>
                                (configs: Config<any>[], inputs: FormInputs<TextProps, NumberProps, ChoiceProps, DateProps>,
                                 hooks: HookReturn,
                                 props: FormProps) {
    const [valid, readonly, value, setValue] = hooks;
    return configs.map((config) => {
        switch(config.type) {
            case "text": {
                const Component = inputs.text;
                if(Component) {
                    return installed(Component, config, hooks)
                } 

                throw notInstalled(config);
            }
            case "number": {
                const Component = inputs.text;
                if(Component) {
                    return installed(Component, config, hooks);
                }

                throw notInstalled(config);
            }
            case "choice": {
                const Component = inputs.choice
                if(Component) {
                    const choices = props.choices[config.name];
                    return (
                        <Component
                            label={config.label}
                            value={value(config.name)}
                            onChange={(val) => {
                                setValue(config.name, val);
                            }}
                            valid={valid(config.name)}
                            readonly={readonly(config.name)}
                            choices={choices ? choices : []}
                            {...config.props as any}
                        ></Component>
                    )
                }

                throw notInstalled(config);
            }
            case "date": {
                const Component = inputs.date
                if(Component) {
                    return installed(Component, config, hooks);
                }

                throw notInstalled(config);
            }
            default: {
                throw new Error(`Unknown form input called ${config.name} with type: ${config.type}`)
            }
        }
    })

    function installed<K extends Props<any>>(Component: InputComponent<K>, config: Config<any>, hooks: HookReturn) {
        const [valid, readonly, value, setValue] = hooks;

        return (
            <Component
                label={config.label}
                value={value(config.name)}
                onChange={(val: any) => {
                    setValue(config.name, val);
                }}
                valid={valid(config.name)}
                readonly={readonly(config.name)}
                {...config.props as any}
            ></Component>
        )
    }

    function notInstalled(config: Config<any>) {
        return new Error(`Could not make form input called ${config.name} with type: ${config.type}: No input was installed`);
    }
}