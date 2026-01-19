import { User } from "../models/user.model.js";
import { fetchFromTMDB } from "../services/tmdb.service.js";

export async function searchPerson(req, res) {
  const { query } = req.params;
  try {
    const response = await fetchFromTMDB(
      `https://api.themoviedb.org/3/search/person?query=${encodeURIComponent(
        query
      )}&language=en-US&page=1&include_adult=false`
    );
    if (response.results.length === 0) {
      return res.status(404).send(null);
    }

    const newEntry = {
      id: response.results[0].id,
      image: response.results[0].profile_path,
      title: response.results[0].name,
      searchType: "person",
      createdAt: new Date(),
    };

    // Check if entry already exists in search history
    const user = await User.findById(req.user._id);
    const existingIndex = user.searchHistory.findIndex(item =>
      item.id === newEntry.id && item.searchType === newEntry.searchType
    );

    if (existingIndex !== -1) {
      // Remove existing entry to avoid duplicates
      user.searchHistory.splice(existingIndex, 1);
    }

    // Add new entry to the beginning of the array
    user.searchHistory.unshift(newEntry);

    // Limit search history to 50 items to prevent it from growing too large
    if (user.searchHistory.length > 50) {
      user.searchHistory = user.searchHistory.slice(0, 50);
    }

    await user.save();

    res.status(200).json({ success: true, content: response.results });
  } catch (error) {
    console.error("Error in searchPerson controller: ", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}
export async function searchMovie(req, res) {
  const { query } = req.params;
  try {
    const response = await fetchFromTMDB(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
        query
      )}&language=en-US&page=1&include_adult=false`
    );
    if (response.results.length === 0) {
      return res.status(404).send(null);
    }

    const newEntry = {
      id: response.results[0].id,
      image: response.results[0].poster_path,
      title: response.results[0].title,
      searchType: "movie",
      createdAt: new Date(),
    };

    // Check if entry already exists in search history
    const user = await User.findById(req.user._id);
    const existingIndex = user.searchHistory.findIndex(item =>
      item.id === newEntry.id && item.searchType === newEntry.searchType
    );

    if (existingIndex !== -1) {
      // Remove existing entry to avoid duplicates
      user.searchHistory.splice(existingIndex, 1);
    }

    // Add new entry to the beginning of the array
    user.searchHistory.unshift(newEntry);

    // Limit search history to 50 items to prevent it from growing too large
    if (user.searchHistory.length > 50) {
      user.searchHistory = user.searchHistory.slice(0, 50);
    }

    await user.save();

    res.status(200).json({ success: true, content: response.results });
  } catch (error) {
    console.error("Error in searchMovie controller: ", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}
export async function searchTv(req, res) {
  const { query } = req.params;
  try {
    const response = await fetchFromTMDB(
      `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(
        query
      )}&language=en-US&page=1&include_adult=false`
    );
    if (response.results.length === 0) {
      return res.status(404).send(null);
    }

    const newEntry = {
      id: response.results[0].id,
      image: response.results[0].poster_path,
      title: response.results[0].name,
      searchType: "tv",
      createdAt: new Date(),
    };

    // Check if entry already exists in search history
    const user = await User.findById(req.user._id);
    const existingIndex = user.searchHistory.findIndex(item =>
      item.id === newEntry.id && item.searchType === newEntry.searchType
    );

    if (existingIndex !== -1) {
      // Remove existing entry to avoid duplicates
      user.searchHistory.splice(existingIndex, 1);
    }

    // Add new entry to the beginning of the array
    user.searchHistory.unshift(newEntry);

    // Limit search history to 50 items to prevent it from growing too large
    if (user.searchHistory.length > 50) {
      user.searchHistory = user.searchHistory.slice(0, 50);
    }

    await user.save();

    res.status(200).json({ success: true, content: response.results });
  } catch (error) {
    console.error("Error in searchTv controller: ", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

export async function getSearchHistory(req, res) {
  try {
    // Remove duplicate entries from search history based on id and searchType
    const uniqueHistory = [];
    const seenEntries = new Set();

    for (const entry of req.user.searchHistory) {
      const entryKey = `${entry.id}-${entry.searchType}`;
      if (!seenEntries.has(entryKey)) {
        seenEntries.add(entryKey);
        uniqueHistory.push(entry);
      }
    }

    // Update the user's search history to remove duplicates
    if (uniqueHistory.length !== req.user.searchHistory.length) {
      await User.findByIdAndUpdate(req.user._id, {
        searchHistory: uniqueHistory
      });
    }

    res.status(200).json({ success: true, history: uniqueHistory });
  } catch (error) {
    console.error("Error in getSearchHistory controller: ", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

export async function removeItemFromSearchHistory(req, res) {
  let { id } = req.params;

  id = parseInt(id);
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { searchHistory: { id: id } },
    });
    res
      .status(200)
      .json({ success: true, message: "Item removed from history" });
  } catch (error) {
    console.error(
      "Error in removeItemFromSearchHistory controller: ",
      error.message
    );
    res.status(500).json({ success: false, message: "Server Error" });
  }
}
