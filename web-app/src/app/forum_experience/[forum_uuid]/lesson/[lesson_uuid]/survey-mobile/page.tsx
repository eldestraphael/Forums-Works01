"use client";

import SurveyComponent from "@/components/surveys/surveyComponent/surveyComponent";
import { useParams } from "next/navigation";
import React from "react";
import { Model } from "survey-core";

const SurveyMobilePage = (props: any) => {
  const params = useParams();
  const { lesson_uuid, forum_uuid } = params;
  const [surveyData, setSurveyData] = React.useState<any>();
  const [submitted, setSubmitted] = React.useState(false);
  const [surveyAnswers, setSurveyAnswers] = React.useState();

  const postMessage = (val: object) => {
    (window as any)?.ReactNativeWebView?.postMessage(JSON.stringify(val));
  };

  const getSurveyData = async () => {
    try {
      postMessage({
        loading: {
          value: true,
        },
      });
      const res = await fetch(`/api/lesson/${lesson_uuid}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const api_data = await res.json();
      if(api_data.data?.lesson_info.asset_type == "survey" && api_data.data?.lesson_info?.asset_info?.survey_data){
      setSurveyData(api_data.data);
      await getSurveyAnswers(api_data.data?.lesson_info?.asset_info.uuid);
      }
    } catch (error) {
      postMessage({
        error: error,
      });
    } finally {
      postMessage({
        loading: {
          value: false,
        },
      });
    }
  };
  const getSurveyAnswers = async (survey_id: string) => {
    try {
        const res = await fetch(`/api/forum/${forum_uuid}/survey/${survey_id}/response`, {
            method: "GET",
            cache: 'no-store',
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await res.json();
        if (res.status == 200) {
            if (data.data?.user_survey_answers) {
                setSurveyAnswers(data.data?.user_survey_answers);
            }
        } else {
          postMessage({
            error: data?.message,
          });
        }
    }
    catch (error: any) {
      postMessage({
        error: error,
      });
    }
}

  React.useEffect(() => {
    getSurveyData();
  }, []);

  const onComplete = async (sender: Model) => {
    const answers = sender.getPlainData();
    const formattedResponse = answers.map((m) => {
      return {
        answer: m.displayValue,
        question: m.title,
        questionKey: m.name,
      };
    });
    const questionsCount = sender.getAllQuestions().length;
    const payload = {
      surveyMetadata: sender.data,
      surveyAnswer: formattedResponse,
    };
    postMessage({
      data: {
        data: payload,
        status: questionsCount,
      },
    });
    setSubmitted(true);
  };

  if (!surveyData || submitted) {
    return <></>;
  }

  return (
    <>
      <SurveyComponent
        data={surveyData?.lesson_info?.asset_info?.survey_data}
        onComplete={onComplete}
        answers={surveyAnswers}
      />
    </>
  );
};

export default SurveyMobilePage;
