import React, { useState, useEffect } from 'react';
import '../../css/NewArticle.css';
import api from '../../api/api';
import { useParams } from 'react-router-dom';
import '../../css/Review.css' 
const ManuscriptReview = function() {
    const [manuscript, setManuscript] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { id } = useParams();

    async function getManuscript(manuscriptId) {
        try {
            const response = await api.post('/editor/article/detail', {
                'id': manuscriptId
            });
            console.log(response.data);
            setManuscript(response.data.data);  // Assuming you're setting manuscript data here
        } catch (error) {
            console.error("Error fetching manuscript:", error);
        }
    }

    useEffect(() => {
        if (!isLoading) {
            setIsLoading(true);  // Mark loading as true
            getManuscript(id);   // Call the function to fetch manuscript data
        }
    }, [id, isLoading]);  // Adding 'id' and 'isLoading' to the dependency array to ensure it only runs when needed

    return (
        <div className="article-background">
            <h1>Manuscript Review</h1>
            {manuscript ? (
                <div dangerouslySetInnerHTML={{ __html: manuscript.title}} /> // Render the manuscript content here
            ) : (
                <p>Loading manuscript...</p>
            )}
        </div>
    );
}

export default ManuscriptReview;
