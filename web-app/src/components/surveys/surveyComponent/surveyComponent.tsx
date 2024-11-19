"use client";
import React, { useEffect } from "react";
import { Model, settings } from "survey-core";
import { Survey } from "survey-react-ui";
import "survey-core/defaultV2.min.css";
import { survey_style } from "./surveyStyle";

interface SurveyComponent {
  data: any;
  onComplete: (data: any) => Promise<void> | void;
  answers?: any
}
settings.showMaxLengthIndicator = false;
function SurveyComponent({ data, onComplete, answers }: SurveyComponent) {
  const survey = new Model(data);
  useEffect(() => {
    if (answers) {
      survey.data = answers;
      survey.mode = 'display';
    }
  }, [answers])
  survey.applyTheme(survey_style);

  survey.onComplete.add(async (sender) => {
    await onComplete(sender);
  });

  survey.onAfterRenderQuestion.add((survey, options) => {
    const question = options.question;
    if (question.getType() === "text" || question.getType() === "comment") {
      const questionElement = options.htmlElement;
      let inputElement: HTMLInputElement | HTMLTextAreaElement | null = null;
      if (question.getType() === "text") {
        inputElement = questionElement.querySelector('input');
      } else if (question.getType() === "comment") {
        inputElement = questionElement.querySelector('textarea');
      }
      if (inputElement) {
        const currentAnswer = answers ? answers[question.name] : "";
        const characterCount = currentAnswer.length;

        // Create a container div for input and character count
        const containerDiv = document.createElement("div");
        containerDiv.style.display = "flex";
        containerDiv.style.justifyContent = "space-between";
        containerDiv.style.alignItems = "center";
        containerDiv.style.marginTop = "5px";

        // Create a character count div
        const charCountDiv = document.createElement("div");
        charCountDiv.id = `char-count-${question.name}`;
        charCountDiv.style.fontSize = "0.8em";
        charCountDiv.style.color = "#555";
        charCountDiv.innerText = `${characterCount} / 1000`;

        // Append the character count div to the container
        containerDiv.appendChild(document.createElement("span")); // Empty span for alignment
        containerDiv.appendChild(charCountDiv);

        // Append the container div after the question's input element
        questionElement.appendChild(containerDiv);

        // Track character count on input change
        inputElement.addEventListener('input', () => {
          const characterCount = inputElement?.value.length;
          charCountDiv.innerText = `${characterCount} / 1000`;
        });
      }
    }
  });

  return <Survey model={survey} />
}

export default SurveyComponent;
