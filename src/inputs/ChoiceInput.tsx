import React from "react";

interface Props {
    label: string;
    value: string;
    onChange: (val: string) => void;
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
            ></select>
        </div>
    )
}
export default ChoiceInput;