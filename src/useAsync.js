import {useEffect, useRef, useState} from "react";

//Make async action easy to track. The status of action can be one of loading, success and error.
export default function useAsync(promiseConstructor, options = {}) {
    const [state, setState] = useState(options.init || {});
    // Avoid to change the state after component is unmounted.
    const unmounted = useRef(true);
    // Avoid the dirty data after executing action repeatedly. The dirty data will be abandoned.
    const lastCallId = useRef(0);
    const execute = (...args)=> {
        if (unmounted.current)
            return;

        const callId = ++lastCallId.current;
        setState(prevState => ({ ...prevState, status: "loading" }));
        options.onLoading && options.onLoading();
        let promiseCall = promiseConstructor;
        if (typeof promiseConstructor !== "function") {
            if (!args || args.length === 0)
                throw new Error("The first argument should be a promiseConstructor name");

            promiseCall = promiseConstructor[args.splice(0, 1)[0]];
        }

        promiseCall(...args).then(data => {
            if (unmounted.current || callId !== lastCallId.current)
                return;
            setState(prevState => ({ ...prevState, status: "success", data }));
            options.onSuccess && options.onSuccess(data);
        }).catch(error=> {
            if (unmounted.current || callId !== lastCallId.current)
                return;

            setState(prevState => ({...prevState, status: "error", error}));
            options.onError && options.onError(error);
        });
    };

    const setData = data => {
        setState(prevState => ({
            ...prevState,
            data: typeof data === "function" ? data(prevState.data) : data
        }));
    }

    useEffect(() => {
        unmounted.current = false;
        return () => {
            unmounted.current = true;
        }
    }, []);

    return {...state, execute, setData};
}