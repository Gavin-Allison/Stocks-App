import { useAppStore } from "../../stores/appStore";

import { Tutorial } from "../report/tutorial"
import { Overview } from "../report/overview"
import { Transactions } from "../report/transactions"
import { Results } from "../report/results"

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