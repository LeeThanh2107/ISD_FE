// src/pages/ListScreen.js
import React, { useEffect, useState, useRef } from 'react';
import api from '../../api/api'
import '../../css/ListScreen.css';

const ListScreen = () => {
    const [articles,setArticle] = useState([]);
    const hasFetched = useRef(false);
    const getListArticle = async function(){
        try{
            const response = await api.get('/editor/article/list');
            console.log(response);
            
            setArticle(response.data.data);
        }catch(err){
        } 
    }
    useEffect(()=>{
        if(!hasFetched.current){
            getListArticle();
            hasFetched.current = true;
        }
    },[])
  return (
    <div className="full-list-wrapper">
      <header className="header">
        <h2 className="page-title">Article List</h2>
      </header>

      <main className="task-list">
        {(articles && articles.length > 0) ?
        (
            articles.map((article, index) => (
                <div key={index} className="task-card full-width">
                    <div>
                    <div className="card-title"><a href={`editor/review/${article.id}`}>{article.title}</a></div>
                    </div>
                    <div className="card-summary">
                        <p>{article.summary}</p>
                    </div>
                    <div className="card-author">
                        <p>{article.authorName}</p>
                    </div>
                  {/* Nội dung công việc */}
                </div>
              ))
            )
    :(
        <div className="task-card full-width">
                  <h3 className="card-title">No article</h3>
                </div>
    )}
      </main>
    </div>
  );
};

export default ListScreen;
