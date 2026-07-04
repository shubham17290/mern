// ============================================
// Ozymandias Poem - Comment Functionality
// ============================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Get DOM elements
    const commentButton = document.querySelector('button');
    const commentTextarea = document.querySelector('textarea');
    
    // Create container for displaying comments
    const commentsContainer = document.createElement('div');
    commentsContainer.id = 'comments-container';
    commentsContainer.className = 'comments-section';
    
    // Insert comments container after the button
    commentButton.parentNode.insertBefore(commentsContainer, commentButton.nextSibling);
    
    // ============================================
    // Load comments from localStorage on page load
    // ============================================
    function loadComments() {
        const storedComments = localStorage.getItem('ozymandiasComments');
        if (storedComments) {
            const comments = JSON.parse(storedComments);
            comments.forEach(comment => {
                displayComment(comment.text, comment.timestamp, false);
            });
        }
    }
    
    // ============================================
    // Display a single comment
    // ============================================
    function displayComment(commentText, timestamp, save = true) {
        // Create comment element
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';
        
        // Create comment header with timestamp
        const commentHeader = document.createElement('div');
        commentHeader.className = 'comment-header';
        
        const commentDate = document.createElement('span');
        commentDate.className = 'comment-date';
        commentDate.textContent = formatDate(timestamp);
        
        commentHeader.appendChild(commentDate);
        
        // Create comment body
        const commentBody = document.createElement('p');
        commentBody.className = 'comment-text';
        commentBody.textContent = commentText;
        
        // Assemble comment
        commentDiv.appendChild(commentHeader);
        commentDiv.appendChild(commentBody);
        
        // Add to container
        commentsContainer.appendChild(commentDiv);
        
        // Save to localStorage if needed
        if (save) {
            saveCommentToStorage(commentText, timestamp);
        }
    }
    
    // ============================================
    // Format timestamp to readable date
    // ============================================
    function formatDate(timestamp) {
        const date = new Date(timestamp);
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    }
    
    // ============================================
    // Save comment to localStorage
    // ============================================
    function saveCommentToStorage(commentText, timestamp) {
        // Get existing comments
        const storedComments = localStorage.getItem('ozymandiasComments');
        let comments = storedComments ? JSON.parse(storedComments) : [];
        
        // Add new comment
        comments.push({
            text: commentText,
            timestamp: timestamp
        });
        
        // Save back to localStorage
        localStorage.setItem('ozymandiasComments', JSON.stringify(comments));
    }
    
    // ============================================
    // Validate comment input
    // ============================================
    function validateComment(commentText) {
        // Trim whitespace
        const trimmedText = commentText.trim();
        
        // Check if empty
        if (trimmedText === '') {
            return {
                valid: false,
                message: 'Please enter a comment before submitting.'
            };
        }
        
        // Check minimum length
        if (trimmedText.length < 3) {
            return {
                valid: false,
                message: 'Comment must be at least 3 characters long.'
            };
        }
        
        // Check maximum length
        if (trimmedText.length > 500) {
            return {
                valid: false,
                message: 'Comment must be less than 500 characters.'
            };
        }
        
        return {
            valid: true,
            message: 'Comment submitted successfully!'
        };
    }
    
    // ============================================
    // Show temporary message to user
    // ============================================
    function showMessage(message, isError = false) {
        // Remove existing message if any
        const existingMessage = document.querySelector('.message-to-user');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-to-user ${isError ? 'error' : 'success'}`;
        messageDiv.textContent = message;
        
        // Insert after comments container
        commentsContainer.parentNode.insertBefore(messageDiv, commentsContainer.nextSibling);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
    
    // ============================================
    // Clear the textarea
    // ============================================
    function clearTextarea() {
        commentTextarea.value = '';
        commentTextarea.focus();
    }
    
    // ============================================
    // Handle comment submission
    // ============================================
    function handleCommentSubmit() {
        const commentText = commentTextarea.value;
        
        // Validate comment
        const validation = validateComment(commentText);
        
        if (!validation.valid) {
            showMessage(validation.message, true);
            // Highlight textarea with red border
            commentTextarea.style.border = '2px solid #ff4444';
            setTimeout(() => {
                commentTextarea.style.border = '';
            }, 2000);
            return;
        }
        
        // Get current timestamp
        const timestamp = new Date().toISOString();
        
        // Display the comment
        displayComment(commentText.trim(), timestamp, true);
        
        // Show success message
        showMessage(validation.message, false);
        
        // Clear the textarea
        clearTextarea();
    }
    
    // ============================================
    // Event Listeners
    // ============================================
    
    // Click event for comment button
    commentButton.addEventListener('click', handleCommentSubmit);
    
    // Enter key event for textarea (Ctrl+Enter to submit)
    commentTextarea.addEventListener('keydown', function(event) {
        if (event.ctrlKey && event.key === 'Enter') {
            handleCommentSubmit();
        }
    });
    
    // Clear error styling on input
    commentTextarea.addEventListener('input', function() {
        if (commentTextarea.style.border) {
            commentTextarea.style.border = '';
        }
    });
    
    // ============================================
    // Initialize: Load existing comments
    // ============================================
    loadComments();
    
    // ============================================
    // Additional Features
    // ============================================
    
    // Add placeholder text if empty
    if (!commentTextarea.placeholder) {
        commentTextarea.placeholder = 'Share your thoughts about the poem...';
    }
    
    // Focus on textarea when page loads
    setTimeout(() => {
        commentTextarea.focus();
    }, 500);
    
    // ============================================
    // Console welcome message
    // ============================================
    console.log('📝 Ozymandias Comment System Initialized');
    console.log('💡 Tip: Press Ctrl+Enter to submit your comment quickly');
    console.log('💾 Comments are automatically saved to your browser');
    
});

// ============================================
// Utility Functions (Global Scope)
// ============================================

/**
 * Clear all comments from localStorage
 * Can be called from browser console: clearAllComments()
 */
function clearAllComments() {
    if (confirm('Are you sure you want to delete all comments? This action cannot be undone.')) {
        localStorage.removeItem('ozymandiasComments');
        location.reload();
    }
}

/**
 * Get total number of comments
 * Can be called from browser console: getCommentCount()
 */
function getCommentCount() {
    const storedComments = localStorage.getItem('ozymandiasComments');
    if (storedComments) {
        const comments = JSON.parse(storedComments);
        console.log(`Total comments: ${comments.length}`);
        return comments.length;
    }
    console.log('No comments yet.');
    return 0;
}

/**
 * Export all comments to console
 * Can be called from browser console: exportComments()
 */
function exportComments() {
    const storedComments = localStorage.getItem('ozymandiasComments');
    if (storedComments) {
        const comments = JSON.parse(storedComments);
        console.log('All Comments:', comments);
        return comments;
    }
    console.log('No comments to export.');
    return [];
}