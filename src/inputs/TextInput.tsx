

import React from "react";

export interface TextProps {
    label: string;
    value: string;
    accessibilityLabel: string;
    onChange: (val: string) => void;
    valid: ["ok", string] | ["error", string]
    readonly: boolean
}

const TextInput: React.FunctionComponent<TextProps> = function (props: TextProps) {

    return (
        <div>
            <label>{props.label}</label>
            <input type={"text"} value={props.value} 
                onChange={(event) => {
                    event.preventDefault();
                    props.onChange(event.target.value);
                }}
            ></input>
            <span>{props.valid[0] === "ok" ? "Valid" : "Invalid"}</span>
            <span>{props.readonly ? "readonly" : "editable"}</span>
        </div>
    )
}

export default TextInput;