import Review from "../models/review.js";

export function addReview(req, res) {
    if (req.user == null) {
        req.status(401).json({
            message: "Unauthorized Access Please Login"
        })
        return
    }

    const data = req.body;

    data.name = req.user.firstName + " " + req.user.lastName;
    data.profilePicture = req.user.profilePicture;
    data.email = req.user.email;

    const newReview = new Review(data);

    newReview.save().then(() => {
        res.json({
            message: "Review Added Successfully"
        });
    }).catch(() => {
        res.status(500).json({
            error: "Review Addition Failed"
        })
    })

}

export function getReviews(req, res) {

    const user = req.user;

    if (user == null || user.role != "admin") {
        Review.find({ isApproved: true }).then((reviews) => {
            res.json(reviews)
        })
        return
    }
    if (user.role == "admin") {
        Review.find().then((reviews) => {
            res.json(reviews)
        })
    }
}

export function deleteReview(req, res) {
    const email = req.params.email;

    if (req.user == null) {
        req.status(401).json({
            message: "Unauthorized Access Please Login"
        })
        return
    }
    if (req.user.role == "admin") {
        Review.deleteOne({ email: email }).then(() => {
            res.json({
                message: "Review Deleted Successfully"
            })
        }).catch(() => {
            res.status(500).json({
                error: "Review Deletion Failed"
            })
        })
        return
    }

    if (req.user.role == "customer") {
        if (req.user.email == email) {
            Review.deleteOne({ email: email }).then(() => {
                res.json({
                    message: "Review Deleted Successfully"
                })
            }).catch(() => {
                res.status(500).json({
                    error: "Review Deletion Failed"
                })
            })
        }

        else {
            res.status(403).json({
                message: "You are not authorized to delete this review"
            })
        }
    }

}

export function approveReview(req, res) {
    const email = req.params.email;

    if (req.user == null) {
        req.status(401).json({
            message: "Unauthorized Access Please Login"
        })
        return
    }
    if (req.user.role == "admin") {
        Review.updateOne({
            email: email
        },
            {
                isApproved: true
            }
        ).then(() => {
            res.json({
                message: "Review Approved Successfully"
            })
        }).catch(() => {
            res.status(500).json({
                error: "Review Approval Failed"
            })
        })
    }else{
        res.status(403).json({
            message: "You are not an admin.Only the admin can authorized to approve this review"
        })
    }
}