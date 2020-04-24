import React from "react";


type Props<Value> = {
    value: Value
    onChange: (val: Value) => void;
    valid?: ValidationResult
    readonly?: boolean
}
type InputComponent<Props> = (new (props: Props) => React.Component<Props>) | (React.FunctionComponent<Props>)

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

type ValidationResult = ["ok", string] | ["error", any]

type Validator<Data> =
    (data: Data) => Promise<ValidationResult>;

type Criterion<Data> = 
    (data: Data) => Promise<boolean>;


type Config<K extends keyof Input> = {
    name: string;
    label: string;
    type: K;
    value: Input[K]
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

        return function make(config: Config<any>[]) {

            return function Form(props: FormProps) {
                const [valid, readonly, value, setValue] = useForm(config, props);
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

function useForm(configs: Config<any>[], props: FormProps): HookReturn {

    const data_: Record<string, any> = configs.reduce((acc, config) => {
        acc[config.name] = config.value;
        return acc;
    }, {} as any);

    const [data, setData] = React.useState(data_);

    const [valid, setValid ] = React.useState({} as Record<string, ValidationResult>);

    const [readonly, setReadonly] = React.useState({} as Record<string, boolean>);

    configs.forEach((config) => {

        runValidation(config.name);
        runCriterion(config.name);
    })

    // Possibly we should create the State first, and then set the values as done above

    const _valid = (name: string): ValidationResult => {
        return valid[name] ? valid[name] : ["ok", ""]
    }

    const _readonly = (name: string): boolean => {
        return readonly[name] ? readonly[name] : false;
    }

    const _value = (name: string) => {
        return data[name];
    }

    const _setValue = (name: string, value: string) => {
        let newData = Object.assign({}, data);
        newData[name] = value;
        setData(newData);

        runValidation(name);
        runCriterion(name);
    }

    setHandle(props);

    return [_valid, _readonly, _value, _setValue];

    function runValidation(name: string) {
        const validator = props.validation[name]
        if(validator) {
            let newValid = Object.assign({}, valid);
            validator(data[name]).then((result) => {
                newValid[name] = result;
                setValid(newValid);
            }).catch((reason) => {
                newValid[name]= ["error", reason !== undefined && reason.toString ? reason.toString() : reason];
                setValid(newValid);
            })
        }
    }

    function runCriterion(name: string) {
        const criterion = props.readonly[name];
        if(criterion) {
            let newReadonly = Object.assign({}, readonly);
            criterion(data[name]).then((result) => {
                newReadonly[name] = result;
                setReadonly(newReadonly);
            }).catch((_reason) => {
                newReadonly[name] = false;
                setReadonly(newReadonly);
            })
        }
    }

    function setHandle(props: FormProps) {
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
            refresh();
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
                            value={value}
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