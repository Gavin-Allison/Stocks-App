import { useAppStore } from '../../stores/appStore';
import { Input } from '../common/ui';

export const PromptInputs = () => {
    const {
        prompt,
        setPrompt,
        promptResponse 
    } = useAppStore(); 
    return (
        <div>
            <Input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(String(e.target.value))}
                className="w-24 ml-2"
            />
            {promptResponse}
        </div>
    )
}