const db = require('../models');
const Project = db.projects;

// Create and Save a new Project
exports.create = (req, res) => {
    if (!req.body.title || !req.body.abstract) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    const project = {
        title: req.body.title,
        category: req.body.category || 'Spatial Ecology',
        abstract: req.body.abstract,
        authors: req.body.authors,
        datePublished: req.body.datePublished || new Date(),
        thumbnail: req.body.thumbnail,
        documentUrl: req.body.documentUrl,
        status: req.body.status || 'published'
    };

    Project.create(project)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Project."
            });
        });
};

// Retrieve all Projects from the database.
exports.findAll = (req, res) => {
    Project.findAll()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving projects."
            });
        });
};

// Find a single Project with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Project.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find Project with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Project with id=" + id
            });
        });
};

// Update a Project by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    Project.update(req.body, {
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Project was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update Project with id=${id}. Maybe Project was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Project with id=" + id
            });
        });
};

// Delete a Project with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Project.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Project was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete Project with id=${id}. Maybe Project was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Project with id=" + id
            });
        });
};
