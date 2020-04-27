import React from "react";

// TODO: User will want DEBOUNCING

/**
 * TODO: Tests for debouncing, changing any props on form causes validation refresh, changing values 
 * TODO:    causes validation refresh, passing in choices are passed into ChoiceInput
 * TODO: Props can be passed in at runtime and config time.
 * TODO: Empty values are correct
 */

export type Props<Value> = {
    label: string;
    value: Value
    onChange: (val: Value) => void;
    accessibilityLabel: string;
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

/**
 * Defines the default value for each input type
 * These input types are intended to correspond to empty inputs.
 */
function getDefault(input: keyof Input) {
    switch(input) {
        case "text": {
            return "";
        }
        case "date": {
            return new Date(NaN);
        }
        case "number": {
            return NaN;
        }
        case "choice": {
            return "";
        }
    }
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
    default?: Input[K]
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
    validation: Record<string, [Validator<any>, string[]] | Validator<any> | undefined>;
    readonly: Record<string, [Criterion<any>, string[]] | Criterion<any> | undefined>;
    choices: Record<string, any[] | undefined>;
    handle: any;
    props?: Record<string, any>
}

type Opts = {
    startActive?: boolean
    name?: string
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

        return function make(config: Config<keyof Input>[], opts?: Opts) {
            const startActive: boolean = opts ? (opts.startActive === undefined ? true : opts.startActive) : true;
            const name: string = opts ? (opts.name === undefined ? "form" : opts.name) : "form";

            return function Form(props: FormProps) {
                const [valid, readonly, value, setValue] = useForm(config, props, startActive);
                return (
                    <React.Fragment>
                        {renderConfig(config, input, [valid, readonly, value, setValue], props, name)}
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

    const data_: Record<string, any> = configs.reduce((acc, config) => {
        acc[config.name] = config.default !== undefined ? config.default : getDefault(config.type);
        return acc;
    }, {} as any);

    const [refreshing, setRefreshing] = React.useState(true);
    const [active, setActive] = React.useState(startActive === undefined ? true: startActive);
    const [data, setData] = React.useState(data_);
    const [valid, setValid ] = React.useState({} as Record<string, ValidationResult>);
    const [readonly, setReadonly] = React.useState({} as Record<string, boolean>);

    const {readonly: criteria, validation: validations} = props;
    const [readonlyDeps, setReadonlyDeps] = React.useState({} as Record<string, string[]>)

    // eslint-disable-next-line
    React.useEffect(() => {
        // We will refresh on every update, if it has been requested.
        if(refreshing) {
            refresh();
            setRefreshing(false);
        }
    })

    React.useEffect(() => {
        let readonlyDeps = {} as Record<string, string[]>
        if(criteria !== undefined) {
            Object.keys(criteria).forEach((name) => {
                const criterion = criteria[name]
                if(criterion instanceof Array) {
                    const triggers = criterion[1]
                    triggers.forEach((trigger) => {
                        if(readonlyDeps[trigger] === undefined) {
                            readonlyDeps[trigger] = [name];
                        } else {
                            readonlyDeps[trigger].push(name);
                        }
                    })
                }
            })
            setReadonlyDeps(readonlyDeps);
            setRefreshing(true);
        }
    }, [criteria])
    
    const [validDeps, setValidDeps] = React.useState({} as Record<string, string[]>);

    
    React.useEffect(() => {
        let validDeps = {} as Record<string, string[]>;
        if(validations !== undefined) {
            Object.keys(validations).forEach((name) => {
                const validator = validations[name];
                if(validator instanceof Array) {
                    const triggers = validator[1];
                    triggers.forEach((trigger) => {
                        if(validDeps[trigger] === undefined) {
                            validDeps[trigger] = [name];
                        } else {
                            validDeps[trigger].push(name)
                        }
                    })
                }
            })
            setValidDeps(validDeps);
            setRefreshing(true);
        }
    }, [validations])

    // We always set the handle to have the latest functions for fetching and setting form data.
    initializeHandle(props);

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
        setData((oldData) => {
            let newData = Object.assign({}, oldData);
            newData[name] = value;

            runValidation(name, newData);
            runCriterion(name, newData);
            runReadonlyDeps(name, newData);
            runValidDeps(name, newData);

            return newData;
        })
    }

    return [_valid, _readonly, _value, _setValue];

    function runValidation(name: string, data: any) {
        let validator = props.validation[name]
        if(validator) {
            if(validator instanceof Array) {
                validator = validator[0];
            }
            validator(data).then((result) => {
                setValid((oldValid) => {
                    let newValid = Object.assign({}, oldValid);
                    newValid[name] = result;
                    return newValid;
                })
            }).catch((reason) => {
                setValid((oldValid) => {
                    let newValid = Object.assign({}, oldValid);
                    newValid[name]= ["error", reason !== undefined && reason.toString ? reason.toString() : reason];
                    return newValid;
                })
            })
        }
    }

    function runCriterion(name: string, data: any) {
        let criterion = props.readonly[name];
        if(criterion) {
            if(criterion instanceof Array) {
                criterion = criterion[0];
            }
            criterion(data).then((result) => {
                setReadonly((oldReadonly) => {
                    let newReadonly = Object.assign({}, oldReadonly);
                    newReadonly[name] = result;
                    return newReadonly;
                })
            }).catch((_reason) => {
                setReadonly((oldReadonly) => {
                    let newReadonly = Object.assign({}, oldReadonly);
                    newReadonly[name] = false;
                    return newReadonly;
                })
            })
        }
    }

    function runReadonlyDeps(name: string, data: any) {
        const deps = readonlyDeps[name];
        if(deps !== undefined) {
            deps.forEach((dep) => {
                runCriterion(dep, data);
            })
        }
    }

    function runValidDeps(name: string, data: any) {
        const deps = validDeps[name];
        if(deps !== undefined) {
            deps.forEach((dep) => {
                runValidation(dep, data);
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

        props.handle.getErrors = () => {
            return Object.values(valid).filter((result) => {
                return result[0] === "error";
            }).map((result) => {
                return result[1];
            })
        }

        props.handle.isFormValid = () => {
            return Object.values(valid).reduce((acc, result) => {
                if(acc) {
                    return result[0] === "ok";
                }
                return false;
            }, true)
        }

        props.handle.setActive = (flag: boolean) => {
            setActive(flag);
            props.handle.refresh();
        }

        props.handle.getActive = () => {
            return active;
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
                                 props: FormProps,
                                 name: string) {
    return configs.map((config) => {
        let runtimeProps = props.props ? (props.props[config.name] ? props.props[config.name] : {}) : {};
        const doInstall = (component: any) => {
            return installed(component, config, hooks, name, runtimeProps);
        }

        switch(config.type) {
            case "text": {
                const Component = inputs.text;
                if(Component) {
                    return doInstall(Component);
                } 

                throw notInstalled(config);
            }
            case "number": {
                const Component = inputs.number;
                if(Component) {
                    return doInstall(Component);
                }

                throw notInstalled(config);
            }
            case "choice": {
                const Component = inputs.choice
                if(Component) {
                    const choices = props.choices[config.name];
                    return (
                        <Component
                            {...installProps(config, hooks, name)}
                            choices={choices ? choices : []}
                            {...config.props as any}
                            {...runtimeProps}
                        ></Component>
                    )
                }

                throw notInstalled(config);
            }
            case "date": {
                const Component = inputs.date
                if(Component) {
                    return doInstall(Component);
                }

                throw notInstalled(config);
            }
            default: {
                throw new Error(`Unknown form input called ${config.name} with type: ${config.type}`)
            }
        }
    })

    function installed<K extends Props<any>>(Component: InputComponent<K>, config: Config<any>, hooks: HookReturn, formTitle: string, runtimeProps: any) {
        return (
            <Component
                {...installProps(config, hooks, formTitle)}
                {...config.props as any}
                {...runtimeProps}
            ></Component>
        )
    }

    function installProps(config: Config<any>, hooks: HookReturn, name: string) {
        const [valid, readonly, value, setValue] = hooks;

        return {
            label: config.label,
            value: value(config.name),
            onChange: (val: any) => {
                setValue(config.name, val);
            },
            valid: valid(config.name),
            readonly: readonly(config.name),
            key: config.name,
            accessibilityLabel: name + "-" + config.name
        }
    }

    function notInstalled(config: Config<any>) {
        return new Error(`Could not make form input called ${config.name} with type: ${config.type}: No input was installed`);
    }
}