interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: string;
}

export default function Spinner({ size = 'md', color = 'blue' }: SpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-2',
        lg: 'h-12 w-12 border-3',
    };

    return (
        <div
            className={`
        ${sizeClasses[size]}
        animate-spin rounded-full
        border-${color}-600 border-t-transparent
      `}
        />
    );
}