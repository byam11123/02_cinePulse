import SearchService from "../services/SearchService.js";
import { ValidationError } from "../utils/errors.js";

export async function searchPerson(req, res, next) {
  try {
    const { query } = req.params;
    const results = await SearchService.searchPerson(query, req.user._id);
    res.status(200).json({ success: true, content: results });
  } catch (error) {
    next(error);
  }
}

export async function searchMovie(req, res, next) {
  try {
    const { query } = req.params;
    const results = await SearchService.searchMovie(query, req.user._id);
    res.status(200).json({ success: true, content: results });
  } catch (error) {
    next(error);
  }
}

export async function searchTv(req, res, next) {
  try {
    const { query } = req.params;
    const results = await SearchService.searchTv(query, req.user._id);
    res.status(200).json({ success: true, content: results });
  } catch (error) {
    next(error);
  }
}

export async function getSearchHistory(req, res, next) {
  try {
    const history = await SearchService.getSearchHistory(req.user._id);
    res.status(200).json({ success: true, history });
  } catch (error) {
    next(error);
  }
}

export async function removeItemFromSearchHistory(req, res, next) {
  try {
    const { id } = req.params;
    const result = await SearchService.removeItemFromSearchHistory(req.user._id, parseInt(id));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
