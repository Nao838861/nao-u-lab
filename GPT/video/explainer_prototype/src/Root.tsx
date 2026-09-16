import React from 'react';
import {Composition} from 'remotion';
import {
  BenefitNarrationPreview,
  C01C17NarrationPreview,
  C01C18NarrationPreview,
  ConstraintNarrationPreview,
  DevelopmentNarrationPreview,
  DrawingNarrationPreview,
  ExplainerPrototype,
  LaterNarrationPreview,
  WorkflowNarrationPreview,
} from './ExplainerPrototype';
import {
  c01C17NarrationDurationInFrames,
  c01C18NarrationDurationInFrames,
} from './c01C17NarrationTiming';
import {benefitNarrationDurationInFrames} from './benefitNarrationTiming';
import {constraintNarrationDurationInFrames} from './constraintNarrationTiming';
import {developmentNarrationDurationInFrames} from './developmentNarrationTiming';
import {drawingNarrationDurationInFrames} from './drawingNarrationTiming';
import {
  laterNarrationPreviewDurationInFrames,
  workflowNarrationPreviewDurationInFrames,
} from './laterNarrationTiming';
import {
  fullCompositionDurationInFrames,
  narrationPreviewDurationInFrames,
} from './narrationTiming';

import {DensePart2,denseDuration} from './DensePart2';
import {IntroReview,IntroReviewCut,IntroReviewC01C04,IntroReviewC01C06,IntroReviewC01C08,IntroReviewC03C04,introReviewDuration} from './IntroReview';
import introManifest from '../narration/intro-review-cuts.json';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="IntroReviewC01C12" component={IntroReview} durationInFrames={introReviewDuration} fps={30} width={1280} height={720}/>
      <Composition id="IntroReviewC01C08" component={IntroReviewC01C08} durationInFrames={introManifest.cuts.slice(0,8).reduce((n,c)=>n+c.durationFrames,0)} fps={30} width={1280} height={720}/>
      <Composition id="IntroReviewC01C06" component={IntroReviewC01C06} durationInFrames={introManifest.cuts.slice(0,6).reduce((n,c)=>n+c.durationFrames,0)} fps={30} width={1280} height={720}/>
      <Composition id="IntroReviewC01C04" component={IntroReviewC01C04} durationInFrames={introManifest.cuts.slice(0,4).reduce((n,c)=>n+c.durationFrames,0)} fps={30} width={1280} height={720}/>
      <Composition id="IntroReviewC03C04" component={IntroReviewC03C04} durationInFrames={introManifest.cuts.slice(2,4).reduce((n,c)=>n+c.durationFrames,0)} fps={30} width={1280} height={720}/>
      {introManifest.cuts.map((c,index)=><Composition key={c.id} id={`IntroReview${c.id}`} component={IntroReviewCut} defaultProps={{index}} durationInFrames={c.durationFrames} fps={30} width={1280} height={720}/>)}
      <Composition id="Part2Rebuilt" component={DensePart2} durationInFrames={denseDuration} fps={30} width={1280} height={720}/>
      <Composition id="Part2Review" component={DensePart2} durationInFrames={denseDuration} fps={30} width={1280} height={720}/>
      <Composition
        id="ExplainerPrototype"
        component={ExplainerPrototype}
        durationInFrames={fullCompositionDurationInFrames}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="ExplainerNarrationPreview"
        component={ExplainerPrototype}
        durationInFrames={narrationPreviewDurationInFrames}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="DevelopmentNarrationPreview"
        component={DevelopmentNarrationPreview}
        durationInFrames={developmentNarrationDurationInFrames}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="BenefitNarrationPreview"
        component={BenefitNarrationPreview}
        durationInFrames={benefitNarrationDurationInFrames}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="ConstraintNarrationPreview"
        component={ConstraintNarrationPreview}
        durationInFrames={constraintNarrationDurationInFrames}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="DrawingNarrationPreview"
        component={DrawingNarrationPreview}
        durationInFrames={drawingNarrationDurationInFrames}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="LaterNarrationPreview"
        component={LaterNarrationPreview}
        durationInFrames={laterNarrationPreviewDurationInFrames}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="WorkflowNarrationPreview"
        component={WorkflowNarrationPreview}
        durationInFrames={workflowNarrationPreviewDurationInFrames}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="C01C17NarrationPreview"
        component={C01C17NarrationPreview}
        durationInFrames={c01C17NarrationDurationInFrames}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="C01C18NarrationPreview"
        component={C01C18NarrationPreview}
        durationInFrames={c01C18NarrationDurationInFrames}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="C01C18NarrationPreview60"
        component={C01C18NarrationPreview}
        durationInFrames={c01C18NarrationDurationInFrames * 2}
        fps={60}
        width={1280}
        height={720}
      />
    </>
  );
};
