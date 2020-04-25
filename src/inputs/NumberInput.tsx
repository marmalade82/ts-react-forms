import React from "react";

interface Props {
    label: string;
    value: number;
    onChange: (val: number) => void;
}

const NumberInput: React.FunctionComponent<Props> = function(props: Props) {

    return (
        <div>
            <label>{props.label}</label>
            <input type={"number"} value={props.value}
                onChange={(event) => {
                    event.preventDefault();
                    props.onChange(event.target.valueAsNumber);
                }}
            ></input>
        </div>
    )
}
export default NumberInput;