import React from "react";

interface LabelValue {
    label: string,
    value: string,
    key: string,
}

interface Props {
    label: string;
    value: string;
    onChange: (val: string) => void;
    choices: LabelValue[];
    accessibilityLabel: string;
    valid: ["ok", string] | ["error", string]
    readonly: boolean
}

const ChoiceInput: React.FunctionComponent<Props> = function(props: Props) {
    return (
        <div>
            <label>{props.label}</label> 
            <select
                value={props.value}
                onChange={(event) => {
                    event.preventDefault();
                    props.onChange(event.target.value);
                }}
            >
                {renderChoices(props.choices)}
            </select>
            <span className="valid">{props.valid[0] === "ok" ? "Valid" : "Invalid"}</span>
            <span className="readonly">{props.readonly ? "Readonly" : "Editable"}</span>
        </div>
    )

    function renderChoices(choices: LabelValue[]) {
        return choices.map((choice) => {
            return (
                <option value={choice.value} key={choice.key}>{choice.label}</option>
            )
        })
    }
}
export default ChoiceInput;