import React, {
    useEffect,
    useRef,
    FocusEvent,
    ClipboardEvent,
    ChangeEvent,
    KeyboardEvent, useImperativeHandle, ForwardRefRenderFunction, forwardRef
} from 'react';
import { ToSecurityCodeProps, ToSecurityCodeRef } from './type';
import useCallbackState from "./hooks/useCallbackState";
import classNames from "classnames";

const InternalSecurityCode: ForwardRefRenderFunction<ToSecurityCodeRef, ToSecurityCodeProps> = (
    {
        fields = 4,
        prefilledCode,
        pattern = 'numberOrLetter',
        onCodeEntered,
        onCodeChanged,
        autoFocus = true,
        className,
        isInvalid = false,
        isValid = false,
        centered = false,
        invalidMessage= 'That\'s an invalid code. Try again.',
        validMessage = 'Verification successful.'
    },
    ref
) => {
    const inputRefs = useRef<HTMLInputElement[]>([])
    const [digits, setDigits] = useCallbackState<string[]>([])

    useEffect(() => {
        return () => {
            inputRefs.current = []
        }
    }, [])

    useEffect(() => {
        const _digits: string[] = []
        if (prefilledCode) {
            prefilledCode.length < fields ? (prefilledCode = prefilledCode.padEnd(fields, ' ')) : (prefilledCode = prefilledCode.substring(0, fields))
            for (let i = 0; i < prefilledCode.length; i++) {
                if (' ' === prefilledCode[i]) {
                    _digits.push('');
                } else {
                    _digits.push(prefilledCode[i]);
                }
            }
        } else {
            for (let i = 0; i < fields; i++) {
                _digits.push('');
            }
        }
        setDigits(_digits)
    }, [prefilledCode])

    /**
     * 通过ref暴露
     */
    useImperativeHandle(ref, () => ({
        clearCode,
        getCode
    }))

    /**
     *    获取焦点
     * @param event
     */
    const handleFocus = (event: FocusEvent<HTMLInputElement>): void => {
        const index = getIndexOfTargetFromEvent(event);
        select(index);
    };

    /**
     * 粘贴
     * @param event
     */
    const handlePaste = (event: ClipboardEvent<HTMLInputElement>): void => {
        event.preventDefault();
        const win = window as any;
        let pasteData: string = "";

        if (event.clipboardData) {
            pasteData = event.clipboardData.getData('Text');
        } else if (win.clipboardData && win.clipboardData.getData) {
            pasteData = win.clipboardData.getData('Text');
        }

        handleChange(pasteData, event);
    };

    /**
     * 输入框内容变化时
     * @param value
     * @param event
     */
    const handleChange = (value: string | number, event: ChangeEvent<HTMLInputElement> | ClipboardEvent<HTMLInputElement>): void => {
        const indexOfTarget = getIndexOfTargetFromEvent(event);
        value = String(value).replace(new RegExp(pattern === 'number' ? "[^0-9]" : "[^0-9a-zA-Z]", "g"), "");

        if ("" !== value) {
            const _digits = digits.slice();
            if (value.length > 1) {
                value.split('').map((val, index) => {
                    if (indexOfTarget + index < fields) {
                        _digits[indexOfTarget + index] = val;
                    }
                })
            } else {
                _digits[indexOfTarget] = value;
            }
            focus(indexOfTarget + value.length);
            if (hasCodeChanged(_digits)) {
                storeInState(_digits);
            }
        }
    }

    /**
     * 比对code更改
     * @param newCode
     */
    const hasCodeChanged = (newCode: string[]): boolean => JSON.stringify(newCode) !== JSON.stringify(digits);

    /**
     * 存储状态
     * @param digits
     */
    const storeInState = (digits: string[]): void => {
        setDigits(digits, () => {
            const digitsStr = digits.join('');
            if (isComplete(digitsStr)) {
                unFocusAll();
                onCodeEntered(digitsStr);
            } else {
                onCodeChanged(digitsStr);
            }
        })
    };

    /**
     * 处理 用户按下键盘按键时
     * @see https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent/keyCode#%E9%94%AE%E7%A0%81%E5%80%BC
     * @param event
     */
    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
        const index = getIndexOfTargetFromEvent(event);

        switch (event.code) {
            case 'Backspace':
                const _digits = digits.slice();
                _digits[index] = '';
                if (hasCodeChanged(_digits)) {
                    storeInState(_digits);
                } else {
                    findContainedInput(index).value = '';
                }
                event.preventDefault();
                focus(index - 1);
                break;
            case 'ArrowLeft':
                event.preventDefault();
                focus(index - 1);
                break;
            case 'ArrowRight':
                event.preventDefault();
                focus(index + 1);
                break;
            case 'ArrowUp':
            case 'ArrowDown':
            case 'NumpadDecimal':
            case 'NumpadSubtract':
            case 'NumpadAdd':
                event.preventDefault();
        }
    };

    /**
     * 处理 用户释放键盘按键时
     * @param event
     */
    const handleKeyUp = (event: KeyboardEvent<HTMLInputElement>): void => {
        const index = getIndexOfTargetFromEvent(event);
        const currentIndex = index < fields - 1 ? index + 1 : index;

        if (digits[index] == event.key) {
            focus(currentIndex);
        }
    }

    /**
     * 检测是否完成
     * @param digits
     */
    const isComplete = (digits: string): boolean | '' => digits && digits.length === fields;

    /**
     * 取消全部焦点
     */
    const unFocusAll = (): void => {
        for (let i = 0; i < fields; i++) {
            const containedInput = findContainedInput(i);
            if (containedInput) {
                containedInput.blur();
            }
        }
    }

    /**
     * 得到焦点
     * @param index
     */
    const focus = (index: number): void => {
        const containedInput = findContainedInput(index);
        if (containedInput) {
            containedInput.focus();
            containedInput.select();
        }
    }

    /**
     * 选中当前
     * @param index
     */
    const select = (index: number): void => {
        const containedInput = findContainedInput(index);
        if (containedInput) {
            containedInput.select();
        }
    }

    /**
     * 查找包含输入
     * @param index
     */
    const findContainedInput = (index: number): HTMLInputElement => {
        return index < inputRefs.current.length ? inputRefs.current[index] : inputRefs.current[inputRefs.current.length - 1];
    }

    /**
     * 从事件获取索引目标
     * @param event
     * @return number
     */
    const getIndexOfTargetFromEvent = (event: KeyboardEvent<HTMLInputElement> | FocusEvent<HTMLInputElement> | ChangeEvent<HTMLInputElement> | ClipboardEvent<HTMLInputElement>): number => Number(event.currentTarget.dataset.index)


    /**
     * 获取code
     */
    const getCode = (): string => digits.join('');

    /**
     * 清理code
     */
    const clearCode = (): void => {
        let newDigits: string[] = [];
        for (let i = 0; i < fields; i++) {
            newDigits.push('');
        }
        setDigits(newDigits, () => {
            focus(0)
        })
    }

    /**
     * 间隔
     * @param slot
     */
    const divider = (slot: number): boolean => {

        if (fields % 3 === 0 || fields % 4 === 0) {
            const num = fields % 3 === 0 ? 3 : 4
            return slot % num === 0 && fields != slot && fields % num === 0
        }

        return false;
    }

    return (
        <div className={'security-code-container'}>
            <div className={classNames('security-code', { ['is-centered']: centered }, className)}>
                {digits.map((num, idx) => (
                    <div
                        className={classNames(
                            'security-code-field-warp',
                            { ['is-divider']: divider(idx + 1) }
                        )}
                        key={idx}>
                        <input
                            className={classNames(
                                'security-code-field', {
                                    ['is-invalid']: isInvalid,
                                    ['is-valid']: isValid,
                                }
                            )}
                            aria-invalid={isInvalid || undefined}
                            data-index={idx}
                            data-id={`CodeInput-${idx}`}
                            autoFocus={autoFocus && 0 === idx}
                            key={`Input${idx}`}
                            maxLength={fields - idx}
                            value={num}
                            ref={ref => {
                                ref && (inputRefs.current[idx] = ref);
                            }}
                            autoCorrect={'off'}
                            autoComplete={0 === idx ? "one-time-code" : "off"}
                            autoCapitalize={'off'}
                            spellCheck={'false'}
                            onChange={event =>
                                handleChange(event.target.value, event)}
                            onFocus={handleFocus}
                            onKeyDown={handleKeyDown}
                            onKeyUp={handleKeyUp}
                            onPaste={handlePaste}
                        />
                    </div>
                ))}
            </div>
            <div className={'security-code-message-container'}>
                {isInvalid && (
                    <span className={'color-red'}>{invalidMessage}</span>
                )}
                {isValid && (
                    <span className={'color-green'}>{validMessage}</span>
                )}
            </div>
        </div>
    )
}

const SecurityCode = forwardRef<ToSecurityCodeRef, ToSecurityCodeProps>(InternalSecurityCode);

if (process.env.NODE_ENV !== 'production') {
    SecurityCode.displayName = 'SecurityCode';
}

export default SecurityCode