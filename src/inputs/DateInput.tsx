


import React from "react";

interface Props {
    value: Date
    onChange: (val: Date) => void;
}

const DateInput: React.FunctionComponent<Props> = function(props: Props) {

    return (
        <div>
            <input type={"date"} value={props.value.toString()} 
                onChange={(event) => {
                    event.preventDefault(); 
                    props.onChange(event.target.valueAsDate);
                }}
            ></input>
        </div>
    )
}
export default DateInput;