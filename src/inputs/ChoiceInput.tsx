import React from "react";

interface Props {
    value: string;
    onChange: (val: string) => void;
}

const ChoiceInput: React.FunctionComponent<Props> = function(props: Props) {
    return (
        <div>
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