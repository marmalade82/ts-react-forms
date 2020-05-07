

import React from "react";

export interface MyTextProps {
    label: string;
    value: string;
    accessibilityLabel: string;
    onChange: (val: string) => void;
    valid: ["ok", string] | ["error", string]
    readonly: boolean
    classNames?: string[]
}

const TextInput: React.FunctionComponent<MyTextProps> = function (props: MyTextProps) {

    return (
        <div className={props.classNames ? props.classNames.join(" ") : ""}>
            <label>{props.label}</label>
            <input type={"text"} value={props.value} 
                onChange={(event) => {
                    event.preventDefault();
                    props.onChange(event.target.value);
                }}
            ></input>
            <span className={"valid"}>{props.valid[0] === "ok" ? "Valid" : "Invalid"}</span>
            <span className={"readonly"}>{props.readonly ? "Readonly" : "Editable"}</span>
        </div>
    )
}

export default TextInput;