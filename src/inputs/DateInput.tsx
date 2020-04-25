


import React from "react";
import moment from "moment";

interface Props {
    label: string;
    value: Date
    onChange: (val: Date) => void;
}

const DateInput: React.FunctionComponent<Props> = function(props: Props) {

    return (
        <div>
            <label>{props.label}</label>
            <input type={"date"} value={
                moment(props.value).isValid() ? "" :
                    moment(props.value).format('YYYY-MM-DD')
            } 
                onChange={(event) => {
                    console.log(event.target.value);
                    event.preventDefault(); 
                    props.onChange(event.target.valueAsDate ? event.target.valueAsDate : new Date(NaN));
                }}
            ></input>
        </div>
    )
}
export default DateInput;