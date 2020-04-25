import React from "react";

interface Props {
    label: string;
    value: number;
    onChange: (val: number) => void;
    accessibilityLabel: string;
    valid: ["ok", string] | ["error", string]
    readonly: boolean
}

const NumberInput: React.FunctionComponent<Props> = function(props: Props) {

    return (
        <div>
            <label>{props.label}</label>
            <input type={"number"} value={ isNaN(props.value) ? "" : props.value }
                onChange={(event) => {
                    event.preventDefault();
                    props.onChange(event.target.valueAsNumber);
                }}
            ></input>
            <span>{props.valid[0] === "ok" ? "Valid" : "Invalid"}</span>
            <span>{props.readonly ? "readonly" : "editable"}</span>
        </div>
    )
}
export default NumberInput;