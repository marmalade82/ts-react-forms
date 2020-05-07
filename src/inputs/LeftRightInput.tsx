


import React from "react";

export interface LeftRightProps {
    label: string;
    value: "left" | "right";
    accessibilityLabel: string;
    onChange: (val: "left" | "right") => void;
    valid: ["ok", string] | ["error", string]
    readonly: boolean
    classNames?: string[]
}

const LeftRightInput: React.FunctionComponent<LeftRightProps> = function (props: LeftRightProps) {

    return (
        <div className={props.classNames ? props.classNames.join(" ") : ""}>
            <label>{props.label}</label>
            <button onClick={() => {
                props.onChange("left");
            }} style={{
                backgroundColor: props.value === "left" ? "pink": undefined,
            }}
            >Left</button>
            <button onClick={() => {
                props.onChange("right");
            }} style={{
                backgroundColor: props.value === "right" ? "pink": undefined,
            }}
            >Right</button>
            <span className={"valid"}>{props.valid[0] === "ok" ? "Valid" : "Invalid"}</span>
            <span className={"readonly"}>{props.readonly ? "Readonly" : "Editable"}</span>
        </div>
    )
}

export default LeftRightInput;