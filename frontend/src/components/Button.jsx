function Button({ children, variant = "primary", ...props }) {
    return (
        <button
            className={`ui-button ui-button--${variant}`}
            {...props}
        >
            {children}
        </button>
    );
}

export default Button;