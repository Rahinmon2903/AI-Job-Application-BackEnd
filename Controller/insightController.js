import Insight from "../Model/insightSchema.js";

// get my insights

export const getMyInsights = async (req, res) => {
    try {
        // getting insights limited
        const insights = await Insight
            .find({ userId: req.user._id })
            .sort({ frequency: -1 })
            .limit(10);

        res.status(200).json(insights);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};