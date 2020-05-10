"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
/**
 * Defines the default value for each input type
 * These input types are intended to correspond to empty inputs.
 */
function getDefault(input) {
    switch (input) {
        case "text": {
            return "";
        }
        case "multi_text": {
            return "";
        }
        case "date": {
            return new Date(NaN);
        }
        case "number": {
            return NaN;
        }
        case "choice": {
            return "";
        }
        case "time": {
            return new Date(NaN);
        }
    }
}
exports.Form = {
    /**
     * Returns a function that, given the correct input, will generate the form.
     */
    install: function (input) {
        return function make(config, opts) {
            var startActive = opts ? (opts.startActive === undefined ? true : opts.startActive) : true;
            var name = opts ? (opts.name === undefined ? "form" : opts.name) : "form";
            return function Form(props) {
                var hooks = useForm(config, props, startActive);
                return (react_1.default.createElement(react_1.default.Fragment, null, renderConfig(config, input, hooks, props, name)));
            };
        };
    }
};
exports.default = exports.Form;
function useForm(configs, props, startActive) {
    var data_ = (configs).reduce(function (acc, config) {
        acc[config.name] = config.default !== undefined ? config.default : getDefault(config.type);
        return acc;
    }, {});
    var _a = react_1.default.useState(true), refreshing = _a[0], setRefreshing = _a[1];
    var _b = react_1.default.useState(startActive === undefined ? true : startActive), active = _b[0], setActive = _b[1];
    var _c = react_1.default.useState(data_), data = _c[0], setData = _c[1];
    var _d = react_1.default.useState({}), valid = _d[0], setValid = _d[1];
    var _e = react_1.default.useState({}), readonly = _e[0], setReadonly = _e[1];
    var _f = react_1.default.useState({}), hide = _f[0], setHide = _f[1];
    // eslint-disable-next-line
    react_1.default.useEffect(function () {
        // We will refresh on every update, if it has been requested.
        if (refreshing) {
            refresh();
            setRefreshing(false);
        }
    });
    var criteria = props.readonly, validations = props.validation, hidden = props.hide;
    // Set up a field to re-check its readonly state if another field is changed.
    var _g = react_1.default.useState({}), readonlyDeps = _g[0], setReadonlyDeps = _g[1];
    react_1.default.useEffect(function () {
        var readonlyDeps = {};
        if (criteria !== undefined) {
            Object.keys(criteria).forEach(function (name) {
                var criterion = criteria[name];
                if (criterion instanceof Array) {
                    var triggers = criterion[1];
                    triggers.forEach(function (trigger) {
                        if (readonlyDeps[trigger] === undefined) {
                            readonlyDeps[trigger] = [name];
                        }
                        else {
                            readonlyDeps[trigger].push(name);
                        }
                    });
                }
            });
            setReadonlyDeps(readonlyDeps);
            setRefreshing(true);
        }
    }, [criteria]);
    //Set up a field to re-check its validity if another field is changed
    var _h = react_1.default.useState({}), validDeps = _h[0], setValidDeps = _h[1];
    react_1.default.useEffect(function () {
        var validDeps = {};
        if (validations !== undefined) {
            Object.keys(validations).forEach(function (name) {
                var validator = validations[name];
                if (validator instanceof Array) {
                    var triggers = validator[1];
                    triggers.forEach(function (trigger) {
                        if (validDeps[trigger] === undefined) {
                            validDeps[trigger] = [name];
                        }
                        else {
                            validDeps[trigger].push(name);
                        }
                    });
                }
            });
            setValidDeps(validDeps);
            setRefreshing(true);
        }
    }, [validations]);
    // Set up a field to re-check its visibility if another field is changed
    var _j = react_1.default.useState({}), hideDeps = _j[0], setHideDeps = _j[1];
    react_1.default.useEffect(function () {
        var hideDeps = {};
        if (hidden !== undefined) {
            Object.keys(hidden).forEach(function (name) {
                var hider = hidden[name];
                if (hider instanceof Array) {
                    var triggers = hider[1];
                    triggers.forEach(function (trigger) {
                        if (hideDeps[trigger] === undefined) {
                            hideDeps[trigger] = [name];
                        }
                        else {
                            hideDeps[trigger].push(name);
                        }
                    });
                }
            });
            setHideDeps(hideDeps);
            setRefreshing(true);
        }
    }, [hidden]);
    // We always set the handle to have the latest functions for fetching and setting form data.
    initializeHandle(props);
    var _valid = function (name) {
        return active && valid[name] !== undefined ? valid[name] : ["ok", ""];
    };
    var _readonly = function (name) {
        return active && readonly[name] !== undefined ? readonly[name] : false;
    };
    var _hide = function (name) {
        return active && hide[name] !== undefined ? hide[name] : false;
    };
    var _value = function (name) {
        return data[name];
    };
    var _setValue = function (name, value) {
        setData(function (oldData) {
            var newData = Object.assign({}, oldData);
            newData[name] = value;
            runValidation(name, newData);
            runReadonly(name, newData);
            runHide(name, newData);
            runReadonlyDeps(name, newData);
            runValidDeps(name, newData);
            runHideDeps(name, newData);
            return newData;
        });
    };
    return {
        valid: _valid,
        readonly: _readonly,
        hide: _hide,
        value: _value,
        setValue: _setValue
    };
    function runValidation(name, data) {
        // Only run validation logic if field is visible.
        var validator = props.validation[name];
        if (validator && hide[name] !== true) {
            if (validator instanceof Array) {
                validator = validator[0];
            }
            validator(data).then(function (result) {
                setValid(function (oldValid) {
                    var newValid = Object.assign({}, oldValid);
                    newValid[name] = result;
                    return newValid;
                });
            }).catch(function (reason) {
                setValid(function (oldValid) {
                    var newValid = Object.assign({}, oldValid);
                    newValid[name] = ["error", reason !== undefined && reason.toString ? reason.toString() : reason];
                    return newValid;
                });
            });
        }
    }
    function runReadonly(name, data) {
        // Only run readonly if field is visible
        var criterion = props.readonly[name];
        if (criterion && hide[name] !== true) {
            if (criterion instanceof Array) {
                criterion = criterion[0];
            }
            criterion(data).then(function (result) {
                setReadonly(function (oldReadonly) {
                    var newReadonly = Object.assign({}, oldReadonly);
                    newReadonly[name] = result;
                    return newReadonly;
                });
            }).catch(function (_reason) {
                setReadonly(function (oldReadonly) {
                    var newReadonly = Object.assign({}, oldReadonly);
                    newReadonly[name] = false;
                    return newReadonly;
                });
            });
        }
    }
    // TODO : rerun validation and readonly for newly visible fields
    function runHide(name, data) {
        var criterion = props.hide[name];
        if (criterion) {
            if (criterion instanceof Array) {
                criterion = criterion[0];
            }
            criterion(data).then(function (result) {
                setHide(function (oldHide) {
                    var newHide = Object.assign({}, oldHide);
                    newHide[name] = result;
                    return newHide;
                });
                // Since we don't run validation on hidden fields, we will 
                // rerun validation if the result changes to false from true
                if (result === false && hide[name] === true) {
                    runValidation(name, data);
                    runReadonly(name, data);
                }
            }).catch(function (_reason) {
                setHide(function (oldHide) {
                    var newHide = Object.assign({}, oldHide);
                    newHide[name] = false;
                    return newHide;
                });
            });
        }
    }
    function runReadonlyDeps(name, data) {
        var deps = readonlyDeps[name];
        if (deps !== undefined) {
            deps.forEach(function (dep) {
                runReadonly(dep, data);
            });
        }
    }
    function runValidDeps(name, data) {
        var deps = validDeps[name];
        if (deps !== undefined) {
            deps.forEach(function (dep) {
                runValidation(dep, data);
            });
        }
    }
    function runHideDeps(name, data) {
        var deps = hideDeps[name];
        if (deps !== undefined) {
            deps.forEach(function (dep) {
                runHide(dep, data);
            });
        }
    }
    /**
     * Configure the prop handle to have the appropriate functions for getting/setting the form data,
     * activating/inactivating the validation and readonly logic
     *
     * May also want to allow caller to read the valid/readonly states as well.
     */
    function initializeHandle(props) {
        props.handle.getForm = function () {
            var d = Object.assign({}, data);
            return d;
        };
        props.handle.setForm = function (data) {
            configs.forEach(function (config) {
                if (data[config.name] !== undefined) {
                    _setValue(config.name, data[config.name]);
                }
            });
        };
        props.handle.getErrors = function () {
            return Object.values(valid).filter(function (result) {
                return result[0] === "error";
            }).map(function (result) {
                return result[1];
            });
        };
        props.handle.isFormValid = function () {
            return Object.values(valid).reduce(function (acc, result) {
                if (acc) {
                    return result[0] === "ok";
                }
                return false;
            }, true);
        };
        props.handle.setActive = function (flag) {
            setActive(flag);
            props.handle.refresh();
        };
        props.handle.getActive = function () {
            return active;
        };
        props.handle.refresh = function () {
            setRefreshing(true);
        };
    }
    /**
     * Rerun all the validations and readonly measures, if
     * the the logic is active.
     */
    function refresh() {
        if (active) {
            configs.forEach(function (config) {
                runValidation(config.name, data);
                runReadonly(config.name, data);
                runHide(config.name, data);
            });
        }
    }
}
function renderConfig(configs, inputs, hooks, props, name) {
    return configs.map(function (config) {
        var runtimeProps = props.props ? (props.props[config.name] ? props.props[config.name] : {}) : {};
        var doInstall = function (component) {
            return installed(component, config, hooks, name, runtimeProps);
        };
        var hide = hooks.hide;
        if (hide(config.name)) {
            return null;
        }
        switch (config.type) {
            case "text": {
                var Component = inputs.text;
                if (Component) {
                    return doInstall(Component);
                }
                throw notInstalled(config);
            }
            case "multi_text": {
                var Component = inputs.multi_text;
                if (Component) {
                    return doInstall(Component);
                }
                throw notInstalled(config);
            }
            case "number": {
                var Component = inputs.number;
                if (Component) {
                    return doInstall(Component);
                }
                throw notInstalled(config);
            }
            case "choice": {
                var Component = inputs.choice;
                if (Component) {
                    var choices = props.choices[config.name];
                    return (react_1.default.createElement(Component, __assign({}, installProps(config, hooks, name), { choices: choices ? choices : [] }, config.props, runtimeProps)));
                }
                throw notInstalled(config);
            }
            case "date": {
                var Component = inputs.date;
                if (Component) {
                    return doInstall(Component);
                }
                throw notInstalled(config);
            }
            case "time": {
                var Component = inputs.time;
                if (Component) {
                    return doInstall(Component);
                }
                throw notInstalled(config);
            }
            default: {
                /**We allow the user to specify other components other than our defaults */
                if (typeof config.type === "string") {
                    var Component = inputs[config.type];
                    if (Component) {
                        return doInstall(Component);
                    }
                }
                throw new Error("Unknown form input called " + config.name + " with type: " + config.type.toString());
            }
        }
    });
    function installed(Component, config, hooks, formTitle, runtimeProps) {
        return (react_1.default.createElement(Component, __assign({}, installProps(config, hooks, formTitle), config.props, runtimeProps)));
    }
    function installProps(config, hooks, name) {
        var valid = hooks.valid, readonly = hooks.readonly, value = hooks.value, setValue = hooks.setValue;
        return {
            label: config.label,
            value: value(config.name),
            onChange: function (val) {
                setValue(config.name, val);
            },
            valid: valid(config.name),
            readonly: readonly(config.name),
            key: config.name,
            accessibilityLabel: name + "-" + config.name
        };
    }
    function notInstalled(config) {
        return new Error("Could not make form input called " + config.name + " with type: " + config.type + ": No input was installed");
    }
}
