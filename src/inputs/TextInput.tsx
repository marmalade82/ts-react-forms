

import React from "react";

export interface Props {
    value: string;
    onChange: (val: string) => void;
}

const TextInput: React.FunctionComponent<Props> = function (props: Props) {

    return (
        <div>
            <input type={"text"} value={props.value} 
                onChange={(event) => {
                    event.preventDefault();
                    props.onChange(event.target.value);
                }}
            ></input>
        </div>
    )
}

export default TextInput;