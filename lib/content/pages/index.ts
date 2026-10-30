import type { PageContent } from "../model.ts";
import { about } from "./about.ts";
import { academy } from "./academy.ts";
import { bespokeCollections } from "./bespokeCollections.ts";
import { bespokeProduct } from "./bespokeProduct.ts";
import { careers } from "./careers.ts";
import { catalogue } from "./catalogue.ts";
import { catalogueThanks } from "./catalogueThanks.ts";
import { complaint } from "./complaint.ts";
import { contact } from "./contact.ts";
import { cookiePolicy } from "./cookiePolicy.ts";
import { customRequest } from "./customRequest.ts";
import { events } from "./events.ts";
import { faqs } from "./faqs.ts";
import { forDevelopers } from "./forDevelopers.ts";
import { forInteriorDesigners } from "./forInteriorDesigners.ts";
import { furnitureCare } from "./furnitureCare.ts";
import { getAQuote } from "./getAQuote.ts";
import { home } from "./home.ts";
import { leadership } from "./leadership.ts";
import { mande } from "./mande.ts";
import { materialsCare } from "./materialsCare.ts";
import { ourTeam } from "./ourTeam.ts";
import { planAVisitation } from "./planAVisitation.ts";
import { privacyPolicy } from "./privacyPolicy.ts";
import { quoteThanks } from "./quoteThanks.ts";
import { refundReturns } from "./refundReturns.ts";
import { rootAndReverence } from "./rootAndReverence.ts";
import { shippingPolicy } from "./shippingPolicy.ts";
import { showrooms } from "./showrooms.ts";
import { termsOfUse } from "./termsOfUse.ts";
import { tradeProgram } from "./tradeProgram.ts";
import { tradeThanks } from "./tradeThanks.ts";
import { warranty } from "./warranty.ts";

/** Every page with editable copy; scripts/content.mts turns these into ACF field groups and seeds them */
export const pages: PageContent[] = [
	about,
	academy,
	bespokeCollections,
	bespokeProduct,
	careers,
	catalogue,
	catalogueThanks,
	complaint,
	contact,
	cookiePolicy,
	customRequest,
	events,
	faqs,
	forDevelopers,
	forInteriorDesigners,
	furnitureCare,
	getAQuote,
	home,
	leadership,
	mande,
	materialsCare,
	ourTeam,
	planAVisitation,
	privacyPolicy,
	quoteThanks,
	refundReturns,
	rootAndReverence,
	shippingPolicy,
	showrooms,
	termsOfUse,
	tradeProgram,
	tradeThanks,
	warranty,
];
