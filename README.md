# TS React Forms #

This library provides a strict but simple interface for creating React Forms from existing React components, and injecting validation and read-only logic into the forms.

The library is built with TypeScript and React. The example project is built in HTML, CSS, and TypeScript (React)

## Features

- Configure the form by installing existing components that meet the required interface
- Declarative form creation by passing in an array of configuration objects that describe each field in the form
- Runtime ability to adjust logic, styles, and field dependencies
- Runtime ability to manipulate the form data and to query for invalid fields
- Usable with both React and React Native

## Example Usage

To use, install your inputs to generate a building function, and then pass the building function an array of field configurations for your form.

To install an input, the input's props must satisfy the required interface. See the docs [here](doc.md) for more.

```
import Form from "ts-react-forms";
import MyApplication from "src/application";

// Install your own class or function inputs
const make = Form.install({
    text: TextInput,
    number: NumberInput,
    date: DateInput,
    choice: ChoiceInput,
})


const PartyForm = make([
    { label: "Name", name: "name"
    , type: "text"
    , default: "" },

    { label: "Guests", name: "num_guests"
    , type: "number"
    , default: 1 },

    { label: "Arrival Date", name: "arrival" 
    , type: "date" },

    { label: "VIP?", name: "vip"
    , type: "choice" }
], {
    name: "Party"
})

function Party = function(props) {
    const handle = {} as any;

    return (
        <div>
            <PartyForm
                handle={handle}
                choices={{
                    vip: [ {label: "Yes", value: "yes" }, { label: "No", value: "no" }]
                }}

                readonly = {{
                    vip: [async (data: any) => {
                        if(data.name.length == 0) {
                            return true;
                        }

                        return false;
                    }, "name"]
                }}

                validation = {{
                    name: async (data: any) => {
                        if(data.name.length == 0) {
                            return ["error", "Name is required"]
                        }

                        return ["ok", ""];
                    }
                }}
            ><PartyForm>

            <button onClick={() => {
                const data = handle.getForm();
                MyApplication.submit(data);
            }}>Submit</button>
        </div>
    );
}

```

## Major Dependencies

- React
- TypeScript

## Build/Deploy Instructions

## Contact

Questions/comments can be sent to <hchen7913@gmail.com>