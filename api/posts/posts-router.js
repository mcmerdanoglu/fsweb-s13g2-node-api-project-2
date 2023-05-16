// posts için gerekli routerları buraya yazın

const express = require("express");

const postsModel = require("./posts-model");

const router = express.Router();

router.get("/", (req, res) => {
  postsModel
    .find()
    .then((posts) => {
      res.json(posts);
    })
    .catch((error) => {
      res.status(500).json({
        message: "Gönderiler alınamadı",
      });
    });
});

router.get("/:id", (req, res) => {
  postsModel
    .findById(req.params.id)
    .then((possiblePost) => {
      if (!possiblePost) {
        res.status(404).json({
          message: "Belirtilen ID'li gönderi bulunamadı",
        });
      } else {
        res.json(possiblePost);
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Gönderi bilgisi alınamadı",
      });
    });
});

router.post("/", (req, res) => {
  const { title, contents } = req.body;
  if (!title || !contents) {
    res.status(400).json({
      message: "Lütfen gönderi için bir title ve contents sağlayın",
    });
  } else {
    postsModel
      .insert(req.body)
      .then(({ id }) => {
        return postsModel.findById(id);
      })
      .then((newPost) => {
        res.status(201).json(newPost);
      })
      .catch((error) => {
        res.status(500).json({
          message: "Veritabanına kaydedilirken bir hata oluştu",
        });
      });
  }
});

router.delete("/:id", async (req, res) => {
  const possiblePost = await postsModel.findById(req.params.id);
  if (!possiblePost) {
    res.status(404).json({
      message: "Belirtilen ID li gönderi bulunamadı",
    });
  } else {
    postsModel
      .remove(req.params.id)
      .then((deletedPost) => {
        res.json(possiblePost);
      })
      .catch((error) => {
        res.status(500).json({
          message: "Gönderi silinemedi",
        });
      });
  }
});

router.put("/:id", (req, res) => {
  const { title, contents } = req.body;
  if (!title || !contents) {
    res.status(400).json({
      message: "Lütfen gönderi için title ve contents sağlayın",
    });
  } else {
    postsModel
      .findById(req.params.id)
      .then((post) => {
        if (!post) {
          res.status(404).json({
            message: "Belirtilen ID'li gönderi bulunamadı",
          });
        } else {
          return postsModel.update(req.params.id, req.body);
        }
      })
      .then((postsModelUpdated) => {
        if (postsModelUpdated) {
          return postsModel.findById(req.params.id);
        }
      })
      .then((updatedPost) => {
        if (updatedPost) {
          res.json(updatedPost);
        }
      })
      .catch((error) => {
        res.status(500).json({
          message: "Gönderi bilgileri güncellenemedi",
        });
      });
  }
});

router.get("/:id/comments", async (req, res) => {
  try {
    const post = await postsModel.findById(req.params.id);
    if (!post) {
      res.status(404).json({
        message: "Girilen ID'li gönderi bulunamadı.",
      });
    } else {
      const comments = await postsModel.findPostComments(req.params.id);
      res.json(comments);
    }
  } catch (error) {
    res.status(500).json({
      message: "Yorumlar bilgisi getirilemedi",
    });
  }
});

module.exports = router;
