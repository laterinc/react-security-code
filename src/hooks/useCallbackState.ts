import { useRef, useState, useEffect } from 'react';

type CallBackState<T> = [T, (d: T, callback?: CallBack<T>) => void];

type CallBack<T> = (d: T) => void;

/**
 * setState 回调函数
 * @param state
 */
function useCallbackState<T = any>(state: T): CallBackState<T> {
    const [data, setData] = useState<T>(state);

    const cbRef = useRef<CallBack<T>>();

    useEffect(() => {
        cbRef.current && cbRef.current(data);
    }, [data]);

    return [
        data,
        function (d: T, callback?: CallBack<T>) {
            cbRef.current = callback;
            setData(d);
        }
    ];
}

export default useCallbackState;