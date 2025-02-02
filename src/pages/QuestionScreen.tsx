//@ts-nocheck
import React from 'react'
import { useSelector } from 'react-redux';
import { useAxios } from '../hooks/useAxios';
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { handleScoreChange } from '../redux/actions';
import { decode } from "html-entities"
import loadingImage from "../assets/90-ring.svg"
const QuestionScreen = () => {
    const [canClick, setCanClick] = React.useState(true);
    const {
        question_category,
        question_type,
        question_difficulty,
        amount_of_questions,
        score
    } = useSelector((state: any) => state);
    const navigate = useNavigate()
    const dispatch = useDispatch()
    console.log({question_category, question_difficulty, question_type})
   
    let apiUrl = `/api.php?amount=5`;
    console.log("url", apiUrl)
    if (question_category) {
        apiUrl = apiUrl.concat(`&category=${question_category}`);
    }
    if (question_difficulty) {
        apiUrl = apiUrl.concat(`&difficulty=${question_difficulty}`);
    }
    if (question_type) {
        apiUrl = apiUrl.concat(`&type=${question_type}`);
    }

    const { response, loading } = useAxios ({ url: apiUrl.toLowerCase() });
    console.log("urlCheck", { url: apiUrl } )
    
    const [currentQuestion, setCurrentQuestion] = React.useState(0);
    const [choices, setChoices] = React.useState([]);
    
    const getRandomInt = (max: number) => {
        return Math.floor(Math.random() * Math.floor(max));
    }


    React.useEffect(() => {
        if (response?.results.length) {
            const question = response.results[currentQuestion];
            let answers = [...question.incorrect_answers];
            answers.splice(
                getRandomInt(question.incorrect_answers.length),
                0,
                question.correct_answer
            );
            setChoices(answers);
            console.log("Question Choices",choices)
        }
    }, [ response, currentQuestion ])

    


    console.log("hello", response)

    
    if (loading) {
        return <div className="loading">
            <img src={loadingImage} alt="loading" />
        </div>
    }

    
    function handleClickAnswer(event: { target: { value: any; }; }){
        //update the score in the store each time the correct answer is chosen
        /*fun fact I came up with some very wacky code to solve this initially using a weird string concatenation 
        and a mixture of strings and javascript... it did not work. However this does 🎉*/ 
        const question = response.results[currentQuestion];
        console.log("clicked", event.target.innerText, question.correct_answer);
        
        
        if (canClick && event.target.innerText === question.correct_answer) {
            console.log("correct")
            setCanClick(false)
            event.target.style.backgroundColor = 'green';
            dispatch(handleScoreChange(score + 1))
            setTimeout(function(){
                event.target.style.backgroundColor = 'white';
                setCanClick(true)
            }, 500)
        }

        else{
            console.log("wrong")
            event.target.style.backgroundColor = 'red';
            setTimeout(function(){
                event.target.style.backgroundColor = 'white';
            }, 500)
        }
        
        if(currentQuestion < response.results.length - 1){

            setTimeout(function(){
                setCurrentQuestion(currentQuestion + 1)
                
            }, 500)
            
        }
        else{
            
            setTimeout(function(){
                setCanClick(true)
                navigate("/results")
            }, 500)
            
        }
        
    }


    
  return (
    <div className="questionScreen">
        <h2 className="question">{decode(response.results[currentQuestion].question)}</h2>
        <div className="choices">
            
            {choices.map((choice: string, index: number) => {
                return <button className="questionButton"onClick={handleClickAnswer} key={index}>{decode(choice)}</button>
            }
            )}


        </div>
            <div className="score">Score: {score} / {response.results.length}</div>

                    
    </div>
  )
}

export default QuestionScreen