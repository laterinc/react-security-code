export type ToSecurityCodeRef = {
    /**
     * 清除 Code
     */
    clearCode: () => void;
    /**
     * 获取 Code
     */
    getCode: () => string;
}

export interface ToSecurityCodeProps {
    /**
     * Code长度
     * @default 4
     */
    fields?: number;
    /**
     * 自动获得焦点
     * @default true
     */
    autoFocus?: boolean;
    /**
     * 居中
     * @default false
     */
    centered?: boolean;
    /**
     * SecurityCode类名，示例：'t-class-security-code-first t-class-security-code-second'
     * @default ''
     */
    className?: string;
    /**
     * 验证无效的
     * @default false
     */
    isInvalid?: boolean;
    /**
     * 验证无效的提示内容
     * @default That's an invalid code. Try again.
     */
    invalidMessage?: string;
    /**
     * 验证通过的
     * @default false
     */
    isValid?: boolean;
    /**
     * 验证通过的提示内容
     * @default Verification successful.
     */
    validMessage?: string;
    onCodeChanged: (digits: string) => void;
    onCodeEntered: (digits: string) => void;
    /**
     * 预填Code
     * @default ''
     */
    prefilledCode?: string;
    /**
     * Code正则
     * @default numberOrLetter
     */
    pattern?: SecurityCodePattern;
}

export type SecurityCodePattern = 'numeral' | 'numeralOrLetter';
