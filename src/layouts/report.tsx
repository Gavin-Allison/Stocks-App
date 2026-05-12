import { useAppStore } from "../stores/appStore";

import { Tutorial } from "../components/report/tutorial"
import { Overview } from "../components/report/overview"
import { Transactions } from "../components/report/transactions"
import { Results } from "../components/report/results"

export const Report = () => {
    const { reportTab } = useAppStore();

    if (reportTab === "Tutorial") {
        return <Tutorial />;
    } else if (reportTab === "Overview") {
        return <Overview />;
    } else if (reportTab === "Transactions") {
        return <Transactions />
    } else {
        return <Results />;
    }
}