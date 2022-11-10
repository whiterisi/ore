import React, { PropsWithChildren, useEffect, useState } from "react";
import styled from "@emotion/styled";
import TopBar from "../molecule/TopBar";
import TeamSideBar from "../molecule/TeamSideBar";
import PageSideBar from "../molecule/PageSideBar";
import NavBar from "../molecule/NavBar";
import Router, { useRouter } from "next/router";

import { layoutInfo } from "../constants";
import { useAppSelector } from "../hooks/reduxHook";

const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const WrapBodyContainer = styled.div`
  display: grid;
  height: 100%;
  grid-template-columns: 70px auto;
`;

const WrapMainContainer = styled.div`
  display: grid;
  grid-template-rows: 50px auto;
  background-color: var(--main-color);
`;

const WrapPageContainer = styled.div`
  display: grid;
  grid-template-columns: 240px auto;
`;

const PageContainer = styled.div`
  background-color: white;
  width: 100%;
  height: 100%;
  overflow: auto;
`;

export default function Layout({ children }: PropsWithChildren<{}>) {
  const { pathname } = useRouter();
  const isLogin = useAppSelector((state) => state.login).isLogin;
  const selectTeam = useAppSelector(
    (state) => state.myTeamsState
  ).selectTeamState;
  useEffect(() => {
    if (selectTeam.idx === -1) return;
    Router.push("/view-page");
  }, [selectTeam.idx]);
  const teamList = useAppSelector((state) => state.myTeamsState).myTeamsState;
  return (
    <Container>
      <TopBar />
      {layoutInfo.onlyPage.has(pathname) || !isLogin ? (
        <PageContainer>{children}</PageContainer>
      ) : (
        <WrapBodyContainer>
          <TeamSideBar />
          <WrapMainContainer>
            <NavBar />
            {layoutInfo.withOnlyNavBar.has(pathname) ||
            teamList.length === 0 ? (
              <PageContainer>{children}</PageContainer>
            ) : (
              <WrapPageContainer>
                <PageSideBar />
                <PageContainer>{children}</PageContainer>
              </WrapPageContainer>
            )}
          </WrapMainContainer>
        </WrapBodyContainer>
      )}
    </Container>
  );
}
