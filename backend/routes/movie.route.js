import express from "express";
import {
  getMovieDetails,
  getMovieTrailers,
  getTrendingMovie,
  getSimiliarMovies,
  getCategoryMovies,
} from "../controllers/movie.controller.js";

const router = express.Router();

router.get("/trending", getTrendingMovie);
router.get("/:id/trailers", getMovieTrailers);
router.get("/:id/details", getMovieDetails);
router.get("/:id/similar", getSimiliarMovies);
router.get("/:category", getCategoryMovies);

export default router;
