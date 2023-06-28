interface WaitForInfoProps {
    loadText: string;
    description: string;
}

export const WaitForInfo: React.FC<WaitForInfoProps> = ({
    loadText,
    description,
}) => {
    return (
        <div className="flex items-center flex-col mr-4 italic">
            <div>{loadText}</div>
            <div>{description}</div>
        </div>
    );
};
