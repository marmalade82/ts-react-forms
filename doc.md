# Documentation #

This document explains the library API and what you can expect it to do.

## Installing an Input

The library expects each of your inputs to have the following props, to work correctly:

```typescript
type InputProps<Value> = {
    label: string;
    value: Value
    onChange: (val: Value) => void;
    accessibilityLabel: string;
    valid?: ["ok", string] | ["error", any]
    readonly?: boolean
}
```

When installing an input, you can install an input as `text`, `choice`, `date`, or `number`. Each type of input specializes the InputProps to work with a specific primitive type:

```typescript
const make = Form.install({
    text: MyTextInput,      // should use InputProps<string>
    choice: MyChoiceInput,  // should use InputProps<string> & {choices: any}
    date: MyDateInput,      // should use InputProps<date>
    number: MyNumberInput,  // should use InputProps<number>
})

/* Notice that the choice input is special: it also requires a "choices" prop that determines 
*  what choices the user can choose from
*/
```

Each primitive type represents the empty value differently:

```typescript
string    => ""
date      => new Date(NaN)
number    => NaN
```

## Create a Form

Once the inputs are installed, you can pass the returned function an array of field configurations to generate the `React.Fragment` that contains the form fields. Each configuration has the following type:

```typescript
type Config<K extends keyof Input> = {
    // When you specify logic for a specific field, you will use this name
    name: string;       

    // The label will be passed to the installed input
    label: string;      

    // valid types are "text", "number", "choice", "date"
    type: K;            

    // Provide an initial value for the input. Otherwise the empty value will be used
    default?: Input[K]  

    // any additional props to pass to the input
    props?: Record<string, any>; 
}

type Input = {
    text: string;       // "text" is a key of Input. Input["text"] has the string type
    number: number;
    choice: string;
    date: Date;
}
```

If you install `MyTextInput` as the `text` input, then the following config will generate a form containing `MyTextInput`, with an initial value of `"Bob"`.

```typescript
const make = Form.install({
    text: MyTextInput,
})

const MyForm = make([
    { label: "First Name",
      name: "first_name",
      type: "text",
      default: "Bob",
      props: {
          className: "text-input"
      }
    }
])
```

## Render the Form

The form can be rendered just like any other React component -- it just needs the correct props.

```typescript
type FormProps = {
    validation: Record<string, [Validator<any>, string[]] | Validator<any> | undefined>;
    readonly: Record<string, [Criterion<any>, string[]] | Criterion<any> | undefined>;
    choices: Record<string, any[] | undefined>;
    handle: any;
    props?: Record<string, any>
}
```

We'll consider each prop in turn.

### Validation

In the simplest case, the `validation` prop expects an object that maps a string to a Validator function. A Validator function takes as its argument a `data` object containing all the fields of the form, and returns a `Promise<["ok", string] | ["error", any]>`. For example, the following validation map specifies that the field named `first_name` is required:

```typescript
const validation = {
    first_name: async function required(data: any) {
        if(data["first_name].length === 0) {
            return ["error", "Name is required"];
        }

        return ["ok", ""];
    }
}
```

The validation will run whenever the `onChange` prop of the input runs -- typically, this is on user input. If the validation for `first_name` should also be run when another field changes, we can specify this as well:

```typescript
const validation = {
    first_name: [ async function requiredIfYoung(date: any) {
        if(data["first_name"].length === 0 && data.age < 20) {
            return ["error", "Name is required"];
        }

        return ["ok", ""];
    }, ["age"]]
}

/* Since the validation depends on the age, we can pass in "age" as a trigger. Now, when someone modifies the "age" field,
*  the "first_name" validation will be rerun.
*/
```

### Readonly

The `readonly` prop follows the same rules as the validation prop, except that a Criterion function takes as its argument a `data` object containing all fields of the form, and returns a Promise<boolean>. For example,

```typescript
const readonly = {
    age: [async function waitForFirstName(data: any){
        return data["first_name"].length === 0
    }, ["first_name"]]
}

/* The age field will be readonly whenever the "first_name" field is empty.
*/
```

### Choices

If you have installed a choice input, the `choices` prop will allow you to provide each choice field with its choices at run-time. For example,

```typescript
const choices = {
    guest_count: [
        {label: "One", value: "one"},
        {label: "Two", value: "two"},
        {label: "Three", value: "three"},
    ]
}

/* This will provide the guest_count field with 3 choices.
*  Remember that this means that the choice input you installed must have a prop called "choices" that can receive
*  what you pass in at run-time.
*/
```

### Handle

The `handle` prop is essentially a ref that you use to gain access to functions for querying the form and refreshing the form. To use it, you can do the following:

```typescript
function MyComponent(props) {
    const [handle] = React.useState({} as any);

    return (
        <div>
            <MyForm
                validation={validation}
                readonly={readonly}
                choices={choices}
                handle={handle}
            ></MyForm>
            <button onClick={() => {
                const data = handle.getForm();
                console.log(data);
            }}>Submit</button>
        </div>
    )
}

/* Clicking `Submit` will log the data object. In our examples, we would see something like

    { age: 5,
      first_name: "Jerry",
      guest_count: "three",
    }
*/
```

The handle prop will also have the following functions:

```typescript
handle.setForm(data);   //Replaces the value in each field with the corresponding field in the `data` object
handle.getErrors();     // Returns an array of all the errors generated by validation
handle.isFormValid();   // Functionally equivalent to (handle.getErrors().length === 0)
handle.setActive(true); // Turn the validation/readonly logic on or off.
handle.refresh();       // Rerun the validation/readonly logic for all fields.
```

### Props

The `props` prop allow you to specify run-time props for each field, overriding any props that were specified in the field's config.

```typescript
const props = {
    first_name: {
        blur: true,
        className: "col-md-3",
    },
    age: {
        className: "col-md-2",
    }
}
```

## Other Options

When creating a form, there are a few additional options you can specify:

```typescript
const opts = {
    // this specifies the name of the form for accessibility purposes. Defaults to "form".
    name: "my-form" 

    // This specifies whether the form starts with its validation logic turned on.
    // This can be set manually later using the handle.setActive function
    startActive: false; 
}

const MyForm = make(configs, opts);
```