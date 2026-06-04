import { useCallback } from 'react';
import { useAppStore } from '../../stores/appStore';
import { Input } from '../common/ui';

export const PromptInputs = () => {
    const prompt = useAppStore(s => s.prompt);
    const setPrompt = useAppStore(s => s.setPrompt);
    const promptResponse = useAppStore(s => s.promptResponse);

    const onChange = useCallback((e: any) => setPrompt(String(e.target.value)), [setPrompt]);

    return (
        <div>
            <Input
                type="text"
                value={prompt}
                onChange={onChange}
                className="w-24 ml-2"
            />
            {promptResponse}
        </div>
    )
}