import { useAppStore } from '../../stores/appStore';

export const PromptInputs = () => {
    const {
        prompt,
        setPrompt,
        promptResponse 
    } = useAppStore(); 
    return (
        <div>
            <input
                type="string"
                value={prompt}
                onChange={(e) => setPrompt(String(e.target.value))}
                className="w-24 bg-white border border-gray-400 rounded ml-2"
            />
            {promptResponse}
        </div>
    )
}