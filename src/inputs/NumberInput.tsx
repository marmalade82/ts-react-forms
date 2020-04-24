import React from "react";

interface Props {
    value: number;
    onChange: (val: number) => void;
}

const NumberInput: React.FunctionComponent<Props> = function(props: Props) {

    return (
        <div>
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