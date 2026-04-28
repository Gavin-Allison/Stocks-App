import { Tutorial } from "../components/report/tutorial"
import { Overview } from "../components/report/overview"
import { Results } from "../components/report/results"

export const Report = ({ tab }: { tab: string }) => {
    if (tab === 'Tutorial') {
        return <Tutorial />;
    } else if (tab === 'Overview') {
        return <Overview />;
    } else {
        return <Results />;
    }
}