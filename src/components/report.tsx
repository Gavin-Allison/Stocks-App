import { Tutorial } from "./report/tutorial"
import { Overview } from "./report/overview"
import { Results } from "./report/results"

export const Report = ({ tab }: { tab: string }) => {
    if (tab === 'Tutorial') {
        return <Tutorial />;
    } else if (tab === 'Overview') {
        return <Overview />;
    } else {
        return <Results />;
    }
}