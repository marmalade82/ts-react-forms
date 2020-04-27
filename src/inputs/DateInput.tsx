


import React from "react";
import moment from "moment";

interface Props {
    label: string;
    value: Date
    onChange: (val: Date) => void;
    accessibilityLabel: string;
    valid: ["ok", string] | ["error", string]
    readonly: boolean
}

const DateInput: React.FunctionComponent<Props> = function(props: Props) {

    return (
        <div>
            <label>{props.label}</label>
            <input type={"date"} value={
                moment(props.value).isValid() ?
                    moment(props.value).format('YYYY-MM-DD') : 
                    ""
            } 
                onChange={(event) => {
                    event.preventDefault(); 
                    props.onChange(event.target.valueAsDate ? moment(event.target.value, "YYYY-MM-DD").toDate() : new Date(NaN));
                }}
            ></input>
            <span className="valid">{props.valid[0] === "ok" ? "Valid" : "Invalid"}</span>
            <span className="readonly">{props.readonly ? "Readonly" : "Editable"}</span>
        </div>
    )
}
export default DateInput;