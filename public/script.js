const socket = io();

const app = new Vue({
    el: '#app',
    data: {
        commentInput: '',
        posts: JSON.parse(localStorage.getItem('posts')) || [],
        imageInput: null,
        imagePreview: null,
        showImagePreview: false,
        serverUrl: 'http://localhost:3000',
    },
    methods: {
        postComment() {
            if (!this.commentInput.trim() && !this.imageInput) {
                alert("Please enter a comment or select an image.");
                return;
            }

            const formData = new FormData();
            formData.append('comment', this.commentInput);
            formData.append('image', this.imageInput);

            fetch(`${this.serverUrl}/post`, {
                method: 'POST',
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                // Update the posts array with the new post
                this.posts.push(data);

                // Emit 'post-added' event to the server
                socket.emit('post-added', data);

                // Save posts to local storage
                localStorage.setItem('posts', JSON.stringify(this.posts));

                // Clear input fields and image preview
                this.commentInput = '';
                this.imageInput = null;
                this.imagePreview = null;
            })
            .catch(error => {
                console.error('Error posting comment:', error);
            });
        },
        deletePost(index) {
            const postId = this.posts[index]._id;

            fetch(`${this.serverUrl}/post/${postId}`, {
                method: 'DELETE',
            })
            .then(() => {
                // Remove the post from the posts array
                this.posts.splice(index, 1);

                // Emit 'post-deleted' event to the server
                socket.emit('post-deleted', postId);

                // Save posts to local storage
                localStorage.setItem('posts', JSON.stringify(this.posts));
            })
            .catch(error => {
                console.error('Error deleting comment:', error);
            });
        },
        handleImageUpload(event) {
            // Set the imageInput property when a new image is selected
            this.imageInput = event.target.files[0];
        },
        toggleImagePreview() {
            if (this.imageInput) {
                this.imagePreview = URL.createObjectURL(this.imageInput);
                this.showImagePreview = !this.showImagePreview;
            }
        },
        closeImagePreview() {
            this.showImagePreview = false;
        },
    },
    created() {
        // Listen for 'post-added' event
        socket.on('post-added', (newPost) => {
            // Handle the received new post
            console.log('Received new post:', newPost);
            // Update your Vue data or perform other actions here
        });

        // Listen for 'post-deleted' event
        socket.on('post-deleted', (deletedPostId) => {
            // Handle the received deleted post ID
            console.log('Received deleted post ID:', deletedPostId);
            // Update your Vue data or perform other actions here
        });
        },
    },
});
