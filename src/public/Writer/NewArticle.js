import Header from "../../components/Header";

function NewArticle(){
    return(
        <div>
            <div>
                <label for="title">Title</label>
                <input id="title" type="text" placeholder="Please enter the title for your article here"></input>
            </div>
            <div>
                <label for="content">
                    Content
                </label>
                <textarea id="content" type="textarea" placeholder="Enter your article's content here"></textarea>
            </div>
        </div>
    )
}