import React from "react";
/**
 * TODO: Tests for debouncing, changing any props on form causes validation refresh, changing values
 * TODO:    causes validation refresh, passing in choices are passed into ChoiceInput
 * TODO: Props can be passed in at runtime and config time.
 * TODO: Empty values are correct
 */
export declare type Props<Value> = {
    label: string;
    value: Value;
    onChange: (val: Value) => void;
    accessibilityLabel: string;
    valid?: ValidationResult;
    readonly?: boolean;
};
export declare type InputComponent<Props> = (new (props: Props) => React.Component<Props>) | (React.FunctionComponent<Props>);
export declare type FormInputs<TextProps extends Props<string>, NumberProps extends Props<number>, ChoiceProps extends Props<string>, DateProps extends Props<Date>> = {
    text?: InputComponent<TextProps>;
    multi_text?: InputComponent<TextProps>;
    number?: InputComponent<NumberProps>;
    choice?: InputComponent<ChoiceProps & {
        choices: any;
    }>;
    date?: InputComponent<DateProps>;
    time?: InputComponent<DateProps>;
};
export declare type OtherFormInputs = {
    [others: string]: any;
};
declare type Input = {
    text: string;
    number: number;
    choice: string;
    date: Date;
    multi_text: string;
    time: Date;
};
export declare type ValidationResult = ["ok", string] | ["error", any];
export declare type CheckValid<Data> = (data: Data) => Promise<ValidationResult>;
export declare type CheckReadonly<Data> = (data: Data) => Promise<boolean>;
export declare type CheckHide<Data> = (data: Data) => Promise<boolean>;
declare type Config<K extends keyof Input, Data, L extends keyof Data> = {
    name: L;
    label: string;
    type: K;
    default?: Input[K];
    props?: Record<string, any>;
};
declare type UserConfig<Data, L extends keyof Data> = {
    name: L;
    label: string;
    type: any;
    default: Data[L];
    props?: Record<string, any>;
};
export declare type ValidationMap<Data> = {
    [K in keyof Data]?: [CheckValid<Data>, string[]] | CheckValid<Data>;
};
export declare type ReadonlyMap<Data> = {
    [K in keyof Data]?: [CheckReadonly<Data>, string[]] | CheckReadonly<Data>;
};
export declare type HideMap<Data> = {
    [K in keyof Data]?: [CheckHide<Data>, string[]] | CheckHide<Data>;
};
export declare type ChoiceMap<Data> = {
    [K in keyof Data]?: any[] | undefined;
};
export declare type PropsMap<Data> = {
    [K in keyof Data]?: any;
};
/**
 * Some fields will require validation. Others will not.
 * Some fields will require being set to read-only. Others will not.
 * Some field will have choices. Others will not.
 *
 * @handle is used to provide functions so for the caller to directly manipulate the internals
 */
export declare type FormProps<Data> = {
    validation: ValidationMap<Data>;
    readonly: ReadonlyMap<Data>;
    hide: HideMap<Data>;
    choices: ChoiceMap<Data>;
    handle: any;
    props?: PropsMap<Data>;
};
declare type Opts = {
    startActive?: boolean;
    name?: string;
};
declare type ReactForm<Data> = React.Component<Omit<FormProps<Data>, "handle">>;
interface FormMethods<Data> {
    getForm: () => Data;
    setForm: (data: Data) => void;
    getErrors: () => string[];
    isFormValid: () => boolean;
    setActive: (flag: boolean) => void;
    getActive: () => boolean;
    refresh: () => void;
}
export declare type FormHandle<Data> = ReactForm<Data> & FormMethods<Data>;
declare const Form: {
    /**
     * Returns a function that, given the correct input, will generate the form.
     */
    install: <TextProps extends Props<string>, NumberProps extends Props<number>, ChoiceProps extends Props<string>, DateProps extends Props<Date>>(input: FormInputs<TextProps, NumberProps, ChoiceProps, DateProps> & OtherFormInputs) => <Data>(config: (Config<"number" | "text" | "choice" | "date" | "multi_text" | "time", Data, keyof Data> | UserConfig<Data, keyof Data>)[], opts?: Opts | undefined) => new (props: Pick<FormProps<Data>, "validation" | "readonly" | "hide" | "choices" | "props">) => ReactForm<Data>;
};
export default Form;
