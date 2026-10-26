export type User={email:string;role:string};
export type Evidence={chunk_id:string;bid_id:string;file:string;page:number|null;section:string;quote:string};
export type Hit={chunk:{chunk_id:string;bid_id:string;file_name:string;page_number:number|null;doc_type:string;text:string;section:string};citation:Evidence;score:number;rerank_score:number|null};
export type FieldValue={value:unknown;sources:Evidence[];confidence:number;notes:string};
export type Extraction={bid_id:string;fields:Record<string,FieldValue>;validation:{passed:number;failed:number;not_found:number;rejected:Record<string,string>};addendum_changes:{field:string;previous_value:unknown;new_value:unknown;addendum_number:number;sources:Evidence[];explanation:string}[];run_id:string;status:string;errors:string[]};
export type Answer={answer:string;sources:Evidence[];confidence:number;notes:string};
export type Bid={bid_id:string;title:string;files:number;chunks:number;has_record:boolean;addendums:number[]};
export type Document={name:string;doc_type:string;pages:number;chunks:number;methods:string[];addendum_number:number|null};
export type Run={id:string;kind:string;status:string;created:number;updated:number;bid_id:string|null;error:string|null;result?:unknown};
export type TraceEvent={time:string;step:string;event?:string;latency_seconds?:number;tokens?:Record<string,number>;attempt?:number;error_type?:string;hits?:number};
export type AgentRole={id:string;name:string;description:string;active_steps:number};
export type Status={agents:AgentRole[];active_agents:number;bids:string[];unavailable_bids:Record<string,string>;llm_configured:boolean;active_jobs:number;embedding_model:string;llm_model:string};
export const fieldGroups:Record<string,string[]>={
 'Overview':['Bid Number','Title','company_name','contact_info','Bid Summary'],
 'Dates & logistics':['Due Date','Bid Submission Type','Term of Bid','Pre Bid Meeting','Installation','Delivery Date'],
 'Commercial & legal':['Bid Bond Requirement','Payment Terms','Any Additional Documentation Required','MFG for Registration','Contract or Cooperative to use'],
 'Products & specifications':['Model_no','Part_no','Product','Product Specification'],
};
