import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { Label, Button } from "../styles";
import { TEAM_USER_API, USERS_API } from "../constants";
import { TeamUserType } from "../types";
import SearchBarTab from "./SearchBarTab";
import axios from "../utils/axios";
import { useAppSelector } from "../hooks/reduxHook";
import SearchTeamAdd from "./SearchTeamAdd";

const TeamMemberManageContainer = styled.div`
  width: 100%;
`;

const MemberLabelContainer = styled.div`
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
`;

const ResultContainer = styled.div`
  height: 220px;
  padding: 5px;
  overflow-y: auto;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 40%;
  height: 40px;
  margin: 20px auto;
`;

const searchMenues = { name: "이름", nickName: "닉네임" };

export default function TeamMemberAdd() {
  const teamId = useAppSelector((state) => state.myTeamsState).selectTeamState
    .teamId;
  const [nameCategoryAll, setNameCategoryAll] = useState<string>("name");
  const [searchAllUserInput, setSearchAllUserInput] = useState<string>("");
  const handleAllSearchUserInput = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchAllUserInput(event.target.value);
  };
  const [searchAllUserResultList, setSearchAllUserResultList] = useState<
    Array<TeamUserType>
  >([]);
  const [addMemberList, setAddMemberList] = useState<Array<number>>([]);
  const [allMemberPage, setAllMemberPage] = useState<number>(-1);
  const [allIo, setAllIo] = useState<IntersectionObserver | null>(null);
  const [isLoadedAll, setIsLoadedAll] = useState<boolean>(true);
  const [isSearchLastAll, setIsSearchLastAll] = useState<boolean>(false);

  const registerObservingElMember = (el: Element) => {
    if (allIo !== null) {
      allIo.observe(el);
    }
  };

  function setScrollTargetAll() {
    const currentTargetClassAll = `${allMemberPage}페이지`;
    const target = document.getElementsByClassName(currentTargetClassAll)[0];
    if (target) {
      registerObservingElMember(target);
    }
  }

  useEffect(() => {
    if (searchAllUserResultList.length > 0) {
      setIsLoadedAll(true);
    }
  }, [searchAllUserResultList.length]);

  useEffect(() => {
    if (isLoadedAll) {
      setScrollTargetAll();
    }
  }, [isLoadedAll]);

  useEffect(() => {
    const targetObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsLoadedAll(false);
          setAllMemberPage(allMemberPage + 1);
          if (allIo !== null) {
            allIo.disconnect();
          }
        }
      });
    });
    setAllIo(targetObserver);
    fetchAllUserResultList();
  }, [allMemberPage]);

  useEffect(() => {
    if (searchAllUserInput !== "" || allMemberPage !== -1) {
      setSearchAllUserResultList([]);
      setAllMemberPage(-1);
      setIsSearchLastAll(false);
      fetchAllUserResultList();
    }
  }, [searchAllUserInput]);

  const fetchAllUserResultList = async () => {
    if (isSearchLastAll === true || allMemberPage === 0) {
      return;
    }
    if (searchAllUserInput === "") {
      const page = allMemberPage === -1 ? 0 : allMemberPage;
      try {
        const params = {
          page: page,
          size: 20,
        };
        const { data } = await axios.get(`${USERS_API.LIST}/${teamId}`, {
          params,
          headers: { Authorization: localStorage.getItem("accessToken") },
        });
        if (allMemberPage === -1) {
          setSearchAllUserResultList(data.data.content);
        } else {
          setSearchAllUserResultList((prev) => {
            return [...prev, ...data.data.content];
          });
        }
        setIsSearchLastAll(data.data.last);
        if (allMemberPage === -1) {
          setAllMemberPage(0);
          setIsLoadedAll(false);
        }
      } catch (e) {}
    } else if (nameCategoryAll === "name") {
      const page = allMemberPage === -1 ? 0 : allMemberPage;
      try {
        const params = {
          keyword: searchAllUserInput,
          page: page,
          size: 20,
        };
        const { data } = await axios.get(USERS_API.NAME, {
          params,
          headers: {
            Authorization: localStorage.getItem("accessToken"),
          },
        });
        if (allMemberPage === -1) {
          setSearchAllUserResultList(data.data.content);
        } else {
          setSearchAllUserResultList((prev) => {
            return [...prev, ...data.data.content];
          });
        }
        setIsSearchLastAll(data.data.last);
        if (allMemberPage === -1) {
          setAllMemberPage(0);
          setIsLoadedAll(false);
        }
      } catch {}
    } else if (nameCategoryAll === "nickName") {
      const page = allMemberPage === -1 ? 0 : allMemberPage;
      try {
        const params = {
          keyword: searchAllUserInput,
          page: page,
          size: 20,
        };
        const { data } = await axios.get(USERS_API.NICKNAME, {
          params,
          headers: {
            Authorization: localStorage.getItem("accessToken"),
          },
        });
        if (allMemberPage === -1) {
          setSearchAllUserResultList(data.data.content);
        } else {
          setSearchAllUserResultList((prev) => {
            return [...prev, ...data.data.content];
          });
        }
        setIsSearchLastAll(data.data.last);
        if (allMemberPage === -1) {
          setAllMemberPage(0);
          setIsLoadedAll(false);
        }
      } catch {}
    }
  };

  const tempAddTeamMember = (
    e: React.MouseEvent,
    buttonText: string,
    id: number
  ): void => {
    if (buttonText === "초대") {
      setAddMemberList((prev) => {
        return [...prev, id];
      });
    } else {
      setAddMemberList((prev) => prev.filter((id) => id !== id));
    }
  };

  const submitTeamMember = async () => {
    try {
      const body = { teamId: teamId, userIdList: addMemberList };
      const { data } = await axios.post(TEAM_USER_API.INVITE, body, {
        headers: { Authorization: localStorage.getItem("accessToken") },
      });
      setAddMemberList([]);
      setSearchAllUserResultList([]);
      setAllMemberPage(-1);
      setIsSearchLastAll(false);
    } catch (error) {}
  };

  return teamId !== -1 ? (
    <TeamMemberManageContainer>
      <MemberLabelContainer>
        <Label>팀원 초대</Label>
      </MemberLabelContainer>
      <SearchBarTab
        category={nameCategoryAll}
        setCategory={setNameCategoryAll}
        MenuItems={searchMenues}
        handleSearchInput={handleAllSearchUserInput}
        fetchResultList={fetchAllUserResultList}
      ></SearchBarTab>
      {searchAllUserResultList.length === 0 ? (
        <></>
      ) : (
        <ResultContainer>
          {searchAllUserResultList.map((member, idx) => (
            <SearchTeamAdd
              key={idx}
              member={member}
              buttonFunction={tempAddTeamMember}
            ></SearchTeamAdd>
          ))}
          {searchAllUserResultList.length !== 0 && isLoadedAll && (
            <div className={`${allMemberPage}페이지`}>
              검색 결과가 더 없습니다.
            </div>
          )}
        </ResultContainer>
      )}
      <ButtonContainer>
        <Button borderRadius="10px" onClick={submitTeamMember}>
          초대
        </Button>
      </ButtonContainer>
    </TeamMemberManageContainer>
  ) : (
    <></>
  );
}