import { INTEREST_CATEGORIES } from "../data/interests.js";

export function listInterestsController(req, res) {
  res.status(200).json({ success: true, interests: INTEREST_CATEGORIES });
}
